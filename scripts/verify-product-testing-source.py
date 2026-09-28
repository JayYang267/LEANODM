"""Read the original workbook independently; never modify it.

Usage: python scripts/verify-product-testing-source.py path/to/source.xlsx
Requires openpyxl, lxml and Pillow (available in the bundled workspace runtime).
"""
from pathlib import Path
from collections import Counter
import hashlib, json, re, sys, warnings, zipfile
import openpyxl
from lxml import etree

root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
data=json.loads((root/'src/data/product-testing.json').read_text(encoding='utf-8'))
assert hashlib.sha256(source.read_bytes()).hexdigest()==data['source']['sha256'], 'Source revision changed: repeat review'
with warnings.catch_warnings():
    warnings.simplefilter('ignore')
    wb=openpyxl.load_workbook(source,data_only=False)
assert wb.sheetnames==['Table 1']
s=wb['Table 1']
assert len(s.merged_cells.ranges)==15
assert not any(c.comment for row in s for c in row)
assert not any(d.hidden for d in s.row_dimensions.values())
assert not any(d.hidden for d in s.column_dimensions.values())
tests=[t for g in data['groups'] for t in g['tests']]
expected={('Left block',r) for r in range(4,25) if r!=10}|{('Right block',r) for r in range(4,23)}
assert {(t['sourceBlock'],t['sourceRow']) for t in tests}==expected
assert len(tests)==39
stages=Counter()
def numbers(text):
    text=text.replace('−','-').replace('－','-').replace('，',',')
    text=re.sub(r'(^|\s)\d+、',r'\1',text) # Numbered list labels are not test parameters.
    text=re.sub(r'(?<=\d),(?=\d{3}(?:\D|$))','',text)
    return {float(n) for n in re.findall(r'(?<![A-Za-z])\d+(?:\.\d+)?',text)}
for t in tests:
    row=t['sourceRow']; left=t['sourceBlock']=='Left block'
    expected_stages=[s[f'{col}{row}'].value for col in ('DEFGH' if left else 'NOPQR') if s[f'{col}{row}'].value]
    assert t['stages']==expected_stages,(t['id'],'stage mismatch')
    stages.update(t['stages'])
    assert t['sourceNumber']==int(str(s[f'{"A" if left else "K"}{row}'].value))
    assert t['sourceRef']==f'Table 1!{"B" if left else "L"}{row}:{"I" if left else "S"}{10 if row==9 and left else row}'
    raw=' '.join(str(s[f'{col}{row}'].value or '') for col in ('CI' if left else 'MS'))
    if left and row==9:
        raw+=' '+str(s['C10'].value)+' '+str(s['I10'].value)
        assert [s[f'{col}10'].value for col in 'DEFGH']==expected_stages
        raw=re.sub(r'<跌落测试[12] [^>]+>','',raw)
    published=' '.join(t['methods']+t['criteria']+t['notes'])
    missing=numbers(raw)-numbers(published)
    assert not missing,(t['id'],'source numbers missing',missing)
by_id={t['id']:t for t in tests}
text=lambda id:' '.join(by_id[id]['methods']+by_id[id]['criteria']+by_id[id]['notes'])
# Independent checks for conditions whose omission would change the evaluation.
for id in ['high-temperature-humidity','high-temperature','low-temperature','temperature-cycling']:
    assert 'power' in text(id).lower() and '1 hour' in text(id) and '10 minutes' in text(id)
assert 'does not say that power remains on' in text('thermal-shock')
assert 'same component' in text('tension')
assert 'clockwise' in text('torque') and 'counterclockwise' in text('torque')
assert 'below 4.5 kg' in text('unpackaged-drop')
assert 'LPC peak < 115 dB and LPA < 85 dB' in text('sound-level')
assert '(N − 1)' in text('carton-load') and '3.5 m ÷' in text('carton-load')
assert 'if a reset occurs' in text('electrostatic')
assert '100/5' in text('print-adhesion') and 'not interpreted' in text('print-adhesion')
assert 'No rust.' in text('salt-spray')
for id in ['battery-life','destructive-tension','operating-current']:
    assert 'source' in text(id) and ('no ' in text(id) or 'not supply' in text(id))
with zipfile.ZipFile(source) as z:
    drawings=etree.fromstring(z.read('xl/drawings/drawing1.xml'))
    assert drawings.xpath('//*[local-name()="t"]/text()')==[]
    for filename,original in [('lining-bond-ok.png','image1.png'),('lining-bond-ng.png','image2.png')]:
        assert (root/'public/images/quality/product-testing'/filename).read_bytes()==z.read('xl/media/'+original)
assert data['samples']==[str(s[f'{c}23'].value).replace('\n',' ') for c in 'NOPQR']
print(json.dumps({'result':'PASS','projects':len(tests),'source_rows':40,'numeric_coverage':'all source numeric values retained','stage_counts':dict(stages),'merges':15,'comments':0,'embedded_images':'2 originals, exact bytes'},ensure_ascii=False,indent=2))
