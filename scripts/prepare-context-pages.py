import json
import os
import re
from pathlib import Path

import pdfplumber

root = Path(__file__).resolve().parents[1]
cache = Path(os.environ["TEMP"]) / "cap-official-110-114"
assets = root / "assets" / "official-exams"
mission_path = root / "data" / "mission-questions.json"
mission = json.loads(mission_path.read_text(encoding="utf-8"))
subject_files = {"國文": "chinese", "英文": "english", "數學": "math", "自然": "science", "社會": "social"}
rendered = 0

for item in mission:
    if item.get("sourceType") != "官方歷屆真題" or not item.get("requiresContext"):
        continue
    match = re.search(r"^(.*-p)(\d+)(\.webp)$", item.get("questionImage", ""))
    if not match:
        raise ValueError(f"{item['id']}: missing current page image")
    page_number = int(match.group(2))
    images = [item["questionImage"]]
    if page_number > 1:
        previous_name = f"{item['source']['year']}-{subject_files[item['subject']]}-p{page_number - 1}.webp"
        previous_path = assets / previous_name
        if not previous_path.exists():
            pdf_path = cache / f"{item['source']['year']}-{subject_files[item['subject']]}.pdf"
            with pdfplumber.open(pdf_path) as pdf:
                page = pdf.pages[page_number - 2]
                page.to_image(resolution=105).original.convert("RGB").save(previous_path, "WEBP", quality=72, method=6)
            rendered += 1
        images = [f"./assets/official-exams/{previous_name}", item["questionImage"]]
    item["questionImages"] = images

mission_path.write_text(json.dumps(mission, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"contextQuestions": sum(1 for item in mission if item.get("requiresContext")), "newPages": rendered}, ensure_ascii=False))
