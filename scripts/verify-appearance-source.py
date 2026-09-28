#!/usr/bin/env python3
"""Compare the appearance page directly with its original DOCX (requires Pillow).

Run after the Astro build, using the Python runtime returned by Codex's workspace
dependency loader, for example in PowerShell:
  & '<bundled-python.exe>' scripts/verify-appearance-source.py --source '<standard.docx>'
Use --dist '<build-directory>' for a build other than the repository's dist/.
No production JSON, extracted fixtures, office installation or network is used.
"""

import argparse
from collections import Counter
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
import posixpath
import re
import sys
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from PIL import Image

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}


def norm(value):
    return re.sub(r"\s+", " ", value).strip()


class Node:
    def __init__(self, tag="root", attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
        self.parent = None

    def walk(self, tag=None):
        for child in self.children:
            if isinstance(child, Node):
                if tag is None or child.tag == tag:
                    yield child
                yield from child.walk(tag)

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()

    def text(self):
        ancestor = self
        while ancestor is not None:
            if (ancestor.tag in {"script", "style", "template"} or "hidden" in ancestor.attrs
                    or re.search(r"(?:display\s*:\s*none|visibility\s*:\s*hidden)", ancestor.attrs.get("style", ""))):
                return ""
            ancestor = ancestor.parent
        return norm(" ".join(c.text() if isinstance(c, Node) else c for c in self.children))


class Tree(HTMLParser):
    VOID = set("area base br col embed hr img input link meta param source track wbr".split())

    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        node.parent = self.stack[-1]
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, value):
        self.stack[-1].children.append(value)


def xml_text(element):
    return norm("".join((node.text or "") if node.tag == f"{{{NS['w']}}}t" else " "
                        for node in element.iter()
                        if node.tag in {f"{{{NS['w']}}}{name}" for name in ("t", "br", "tab", "cr")}))


def source_rows(table):
    return [[xml_text(cell) for cell in row.findall("w:tc", NS)] for row in table.findall("w:tr", NS)]


def html_rows(table):
    return [[cell.text() for cell in row.children if isinstance(cell, Node) and cell.tag in {"th", "td"}]
            for row in table.walk("tr")]


def one(nodes, label):
    values = list(nodes)
    if len(values) != 1:
        raise ValueError(f"Expected one {label}; found {len(values)}")
    return values[0]


def verify(source, dist):
    page = dist / "quality/appearance-inspection/index.html"
    dom = Tree(page.read_text(encoding="utf-8")).root
    errors, counts = [], Counter()

    def check(ok, message):
        if not ok:
            errors.append(message)

    def table_with_class(root, name):
        return one((n for n in root.walk("table") if n.has_class(name)), name)

    with ZipFile(source) as archive:
        body = ET.fromstring(archive.read("word/document.xml")).find("w:body", NS)
        blocks = list(body)
        relationships = {r.attrib["Id"]: r.attrib["Target"] for r in
                         ET.fromstring(archive.read("word/_rels/document.xml.rels"))}
        starts = [(i, int(m.group(1))) for i, b in enumerate(blocks)
                  if b.tag.endswith("}p") and (m := re.match(r"^6\s+(\d+)\s+", xml_text(b)))]
        sections = {number: blocks[i + 1:starts[j + 1][0] if j + 1 < len(starts) else len(blocks)]
                    for j, (i, number) in enumerate(starts)}
        check(list(sections) == list(range(1, 16)), "Source must contain categories 1 through 15 in order")
        articles = {}
        for article in (n for n in dom.walk("article") if n.has_class("inspection-defect")):
            label = one((n for n in article.walk() if n.has_class("inspection-source-section")), "source section label")
            match = re.fullmatch(r"SOURCE §6\.(\d+)", label.text())
            if not match:
                raise ValueError(f"Unexpected section label: {label.text()}")
            number = int(match.group(1))
            check(number not in articles, f"Duplicate HTML category {number}")
            articles[number] = article
        check(list(articles) == list(sections), "HTML categories must match source order and count")

        def paragraphs(number):
            return [xml_text(b) for b in sections[number] if b.tag.endswith("}p") and xml_text(b)]

        source_definitions = one((b for b in blocks if b.tag.endswith("}tbl")
                                  and source_rows(b)[0] == ["Surface class", "Definition"]), "source surface table")
        surface_rows = html_rows(table_with_class(dom, "surface-table"))[1:]
        for expected in source_rows(source_definitions)[1:]:
            check(expected in surface_rows, f"Surface definition differs: {expected[0]}")
            counts["surface definitions"] += 1
        severity_rows = html_rows(table_with_class(dom, "severity-table"))[1:]
        for i, block in enumerate(blocks[:-1]):
            if (match := re.fullmatch(r"(Critical|Major|Minor) defect (CR|MA|MI)", xml_text(block))):
                expected = xml_text(blocks[i + 1])
                check(any(match.group(2) in row[0] and row[1] == expected for row in severity_rows),
                      f"Severity definition differs: {match.group(2)}")
                counts["severity definitions"] += 1

        conditions = one((n for n in dom.walk("dl") if n.has_class("inspection-conditions")), "inspection conditions")
        for block in blocks:
            value = xml_text(block)
            if (match := re.match(r"^(Illumination|Viewing distance|Observation time):\s*(.*)", value)):
                label, detail = match.groups()
                condition = one((n for n in conditions.children if isinstance(n, Node)
                                 and any(dt.text() == label for dt in n.walk("dt"))), label)
                visible = condition.text()
                # Derive quantities from the source, preserving range, unit and lower bound.
                quantities = re.findall(r"(?:at least\s+)?\d+(?:[–-]\d+)?\s*(?:lx|cm|seconds)", detail)
                check(bool(quantities) and all(q in visible for q in quantities), f"Condition quantity differs: {label}")
                for word in ("fluorescent", "indoor", "directly", "each surface"):
                    if word in detail.lower():
                        check(word in visible.lower(), f"Condition qualification missing: {label}: {word}")
                counts["inspection conditions"] += 1

        original_images = []
        for number, section in sections.items():
            if number not in articles:
                continue
            article, paras = articles[number], paragraphs(number)
            counts["categories"] += 1
            description = one((n for n in article.walk("p") if n.has_class("inspection-definition")), "description")
            acceptance = [b for b in section if b.tag.endswith("}tbl")
                          and source_rows(b)[0] == ["Surface class", "Acceptance criteria"]]
            if number != 15:
                expected = next((p.removeprefix("Defect description: ") for p in paras if p.startswith("Defect description: ")),
                                paras[paras.index("Defect item") + 1])
                check(description.text().removeprefix("What it is. ") == expected, f"Category {number}: description differs")
                counts["supported descriptions"] += 1
                actual = html_rows(table_with_class(article, "criteria-table"))[1:]
                if acceptance:
                    expected_rows = source_rows(one(acceptance, "source acceptance table"))[1:]
                    check(actual == expected_rows, f"Category {number}: acceptance rows differ from source")
                    counts["source acceptance paragraphs"] += len(expected_rows)
                else:
                    # Deformation is assessed as an assembly; it has no A/B/C matrix.
                    after_description = paras.index("Defect description: " + expected) + 1
                    expected_paras = paras[after_description:]
                    check(len(actual) == 1 and actual[0][0] == "All surfaces (assembly assessment)"
                          and actual[0][1] == norm(" ".join(expected_paras)), "Deformation acceptance paragraphs differ")
                    counts["source acceptance paragraphs"] += len(expected_paras)
                expected_additional = paras[paras.index("Additional requirements") + 1:] if "Additional requirements" in paras else []
                additional = [n for n in article.walk() if n.has_class("inspection-additional")]
                actual_additional = [p.text() for n in additional for p in n.walk("p")]
                check(actual_additional == expected_additional, f"Category {number}: additional requirements differ")
                counts["additional requirements"] += len(expected_additional)
            else:
                # If the original is corrected later, fail until its new rules are implemented.
                deformation = paragraphs(13)
                bad_paras = deformation[deformation.index("Acceptance criteria") + 1:]
                check(paras[paras.index("Acceptance criteria") + 1:] == bad_paras,
                      "Source printing section has changed; review its new acceptance criteria")
                check(not any(p in article.text() for p in bad_paras), "Printing category contains deformation text")
                check(not list(article.walk("table")), "Printing category must not invent an acceptance table")
                note = one((n for n in article.walk() if n.has_class("inspection-source-note")), "printing source clarification").text().lower()
                check(all(term in note for term in ("source repeats", "deformation", "no print-specific acceptance limits", "major defect (ma)")),
                      "Printing source clarification is absent or incomplete")

            photo_table = one((b for b in section if b.tag.endswith("}tbl") and b.findall(".//a:blip", NS)), "source photo table")
            rel_ids = [image.attrib[f"{{{NS['r']}}}embed"] for image in photo_table.findall(".//a:blip", NS)]
            captions = source_rows(photo_table)[1]
            figures = list(article.walk("figure"))
            check(len(figures) == len(rel_ids) == len(captions), f"Category {number}: image count differs")
            for figure, rel_id, caption in zip(figures, rel_ids, captions):
                check(one(figure.walk("figcaption"), "figure caption").text() == caption, f"Category {number}: caption differs: {caption}")
                image = one(figure.walk("img"), "figure image")
                check(bool(image.attrs.get("alt", "").strip()), f"Category {number}: image has no alt text")
                target = posixpath.normpath("word/" + relationships[rel_id])
                original_images.append(target)
                image_url = urlsplit(image.attrs["src"])
                built_path = (dist / unquote(image_url.path).lstrip("/")).resolve()
                check(not image_url.netloc and built_path.is_relative_to(dist.resolve()), "Image must resolve inside the build")
                if image_url.netloc or not built_path.is_relative_to(dist.resolve()):
                    continue
                with Image.open(BytesIO(archive.read(target))) as original, Image.open(built_path) as webp:
                    check(webp.format == "WEBP", f"Expected WebP: {built_path.name}")
                    check(webp.size == original.size and webp.convert("RGBA").tobytes() == original.convert("RGBA").tobytes(),
                          f"Pixels differ: category {number}, {target} -> {built_path.name}")
                    check((image.attrs.get("width"), image.attrs.get("height")) == tuple(map(str, original.size)),
                          f"HTML image dimensions differ: {built_path.name}")
                counts["captions and lossless image comparisons"] += 1
        media = [name for name in archive.namelist() if name.startswith("word/media/") and not name.endswith("/")]
        check(len(original_images) == len(set(original_images)) == len(media) == 35,
              "Expected all 35 distinct embedded source images exactly once in the defect articles")
        for name in ("surface definitions", "severity definitions", "inspection conditions"):
            check(counts[name] == 3, f"Expected exactly three {name}")

    for name, count in counts.items():
        print(f"{name}: {count}")
    for error in errors:
        print(f"FAIL: {error}", file=sys.stderr)
    print("PASS: built appearance page preserves the original source" if not errors else f"FAIL: {len(errors)} source-parity issues")
    return int(bool(errors))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", required=True, type=Path, help="Original appearance-inspection DOCX")
    parser.add_argument("--dist", type=Path, default=Path(__file__).resolve().parents[1] / "dist", help="Astro build directory")
    args = parser.parse_args()
    try:
        sys.exit(verify(args.source, args.dist))
    except (OSError, ValueError, KeyError, ET.ParseError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
