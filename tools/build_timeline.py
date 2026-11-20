"""Build TIMELINE.md from timeline.csv. Run from the repo root: python3 tools/build_timeline.py"""
import csv, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
rows = list(csv.DictReader(open(root / "timeline.csv", newline="", encoding="utf-8")))
rows.sort(key=lambda r: r["sort_key"])

def cell(s):
    return (s or "").replace("|", "/").replace("\n", " ")

out = [
    "# Timeline",
    "",
    "Generated from timeline.csv by tools/build_timeline.py. Edit the CSV, not this file.",
    "",
    "Grades: Document (a primary document says it), Reported (a person or secondary source says it, named in the Source column).",
    "Our own inferences are not in this table. They are in OPEN-QUESTIONS.md.",
    "",
    "| Date | Event | Grade | Source | Where in the source | Notes |",
    "|:-|:-|:-|:-|:-|:-|",
]
for r in rows:
    out.append("| " + " | ".join(cell(r[k]) for k in ["date", "event", "evidence_grade", "source", "locator", "notes"]) + " |")
(root / "TIMELINE.md").write_text("\n".join(out) + "\n", encoding="utf-8")
print(len(rows), "rows written to TIMELINE.md")
