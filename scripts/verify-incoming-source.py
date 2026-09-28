"""Compare published data with the independently extracted original table rows.

The reviewed extraction is intentionally outside the public repository. Example:
python scripts/verify-incoming-source.py --rows path/to/inspection-rows.json --original path/to/source.doc
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re

p = argparse.ArgumentParser()
p.add_argument('--rows', required=True)
p.add_argument('--original', required=True)
a = p.parse_args()
repo = Path(__file__).resolve().parents[1]
data = json.loads((repo / 'src/data/incoming-standard.json').read_text(encoding='utf-8'))
source = {r['id']: r for r in json.loads(Path(a.rows).read_text(encoding='utf-8-sig'))}
assert hashlib.sha256(Path(a.original).read_bytes()).hexdigest() == data['source']['sha256'], 'Original source identity changed'
materials = [m for f in data['families'] for m in f['materials']]
assert len(materials) == 20
seen = []
counts = Counter()
for material in materials:
    for row in material['rows']:
        ref = re.sub(r'Table (\d+), row (\d+)', r'T\1R\2', row['sourceRef'])
        assert ref in source, f'Unknown source row {ref}'
        seen.append(ref)
        s = source[ref]
        expected = s['severity']
        actual = re.findall(r'\b(?:CR|MAJ|MIN)\b', row['severity'])
        assert actual == expected, f'Severity mismatch: {ref} {actual} != {expected}'
        counts[' / '.join(expected) or 'Not marked'] += 1
        if not s['method'].strip():
            assert row['method'] == 'Not specified in source', f'Invented method: {ref}'
        else:
            assert row['method'] != 'Not specified in source', f'Missing method: {ref}'
        # Ignore source list item numbers, then require every literal quantity.
        original = re.sub(r'^\s*\d+\.', '', s['criterion'])
        published = row['criterion']
        for word, number in [('two', '2'), ('one', '1')]:
            published = re.sub(r'\b' + word + r'\b', number, published, flags=re.I)
        quantities = set(re.findall(r'\d+(?:\.\d+)?', original))
        translated = set(re.findall(r'\d+(?:\.\d+)?', published))
        # mm2 in the source is rendered as the proper superscript unit mm².
        if 'mm2' in original and 'mm²' in published:
            translated.add('2')
        missing = quantities - translated
        assert not missing, f'Numeric quantity missing in {ref}: {missing}'
assert len(seen) == len(set(seen)) == len(source) == 199, 'Coverage or duplicate-row problem'
assert set(seen) == set(source), 'Source rows omitted'
assert counts == {'MAJ':150, 'MIN':38, 'CR':8, 'CR / MAJ':2, 'Not marked':1}, counts
print('PASS: original SHA-256, all 199 unique source rows, 20 materials, exact severity marks, blank-method handling and literal quantitative coverage')
print('Human review remains required for translation meaning, units, comparison operators and source ambiguity; see the source-QA record.')
