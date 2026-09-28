"""Verify published content, GitHub main and Netlify production identity.
Usage: python scripts/verify-product-testing-release.py COMMIT OUTPUT.json
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, re, sys, urllib.request
from lxml import html

root=Path(__file__).resolve().parents[1]
commit=sys.argv[1]
output=Path(sys.argv[2])
route='/quality/product-testing/'
data=json.loads((root/'src/data/product-testing.json').read_text(encoding='utf-8'))
tests=[t for g in data['groups'] for t in g['tests']]
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'LEANODM-release-verification','Cache-Control':'no-cache'}),timeout=35) as r:
        return r.status,r.read(),dict(r.headers),r.url
def norm(s):return re.sub(r'\s+',' ',s).strip()
def mainhash(doc):return hashlib.sha256(norm(doc.xpath('//main')[0].text_content()).encode()).hexdigest()
local=html.fromstring((root/'dist/quality/product-testing/index.html').read_bytes())
expected_hash=mainhash(local)
def check(origin):
    status,body,headers,url=get(origin+route)
    doc=html.fromstring(body)
    assert status==200
    assert mainhash(doc)==expected_hash,(origin,'HTML main differs from verified build')
    assert doc.xpath('//link[@rel="canonical"]/@href')==['https://www.leanodm.com'+route]
    assert len(doc.xpath('//details[contains(concat(" ",normalize-space(@class)," ")," pt-test ")]'))==39
    all_text=norm(doc.xpath('//main')[0].text_content())
    for t in tests:
        for value in t['methods']+t['criteria']+t['notes']:assert norm(value) in all_text,(origin,t['id'])
    assets=[]
    styles=[]
    links=set(doc.xpath('//a/@href'))
    local_styles=local.xpath('//link[@rel="stylesheet"]/@href')
    remote_styles=doc.xpath('//link[@rel="stylesheet"]/@href')
    assert len(remote_styles)==len(local_styles),(origin,'Missing stylesheet')
    for expected,actual in zip(local_styles,remote_styles):
        st,bb,_,_=get(origin+actual)
        assert st==200 and len(bb)>0
        # Global Tailwind CSS differs across the existing build toolchains
        # (vendor prefixes and saturated border-radius values). Browser QA checks
        # those rendered styles. This page's own stylesheet must match exactly.
        shared=Path(expected).name.startswith('BaseLayout.')
        if not shared:
            assert bb==(root/'dist'/expected.lstrip('/')).read_bytes(),(origin,'Page CSS differs',actual)
        styles.append({'path':actual,'sha256':hashlib.sha256(bb).hexdigest(),'matches_local_build':bb==(root/'dist'/expected.lstrip('/')).read_bytes(),'required_byte_match':not shared})
    assets+=doc.xpath('//main//img/@src')
    assets+=['/resources/product-testing-project-brief.txt']
    for asset in assets:
        if asset.startswith('/'):
            st,bb,_,_=get(origin+asset)
            assert st==200
            assert bb==(root/'dist'/asset.lstrip('/')).read_bytes(),(origin,'Asset differs',asset)
    routes=sorted({u.split('#')[0] for u in links if u.startswith('/') and not u.startswith('//')})
    for p in routes:assert get(origin+p)[0]==200,(origin,p)
    for p in ['/quality/appearance-inspection/','/quality/incoming-inspection/']:
        _,bb,_,_=get(origin+p)
        assert route in html.fromstring(bb).xpath('//a/@href'),(origin,'Missing related navigation',p)
    return {'origin':origin,'url':url,'status':status,'main_sha256':expected_hash,'projects':39,'assets_match_build':len(assets),'stylesheets':styles,'internal_routes_checked':routes,'server':headers.get('Server'),'cache':headers.get('CF-Cache-Status')}
with ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(check,['https://leanodm.netlify.app','https://www.leanodm.com','https://leanodm.com']))
_,b,_,_=get('https://api.github.com/repos/JayYang267/LEANODM/commits/main')
github=json.loads(b);assert github['sha']==commit,('GitHub main differs',github['sha'])
_,b,_,_=get('https://api.netlify.com/api/v1/sites/leanodm.netlify.app')
deploy=json.loads(b)['published_deploy']
assert deploy['commit_ref']==commit and deploy['state']=='ready' and deploy['context']=='production'
record={'result':'PASS','commit':commit,'github':github['html_url'],'netlify':{k:deploy.get(k) for k in ['id','state','context','branch','commit_ref','published_at','deploy_ssl_url']},'sites':results}
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(record,ensure_ascii=False,indent=2))
