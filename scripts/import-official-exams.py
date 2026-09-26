import json,re,os,sys
from pathlib import Path
import pdfplumber

root=Path(__file__).resolve().parents[1]
cache=Path(os.environ['TEMP'])/'cap-official-110-114'
out_assets=root/'assets'/'official-exams'
out_assets.mkdir(parents=True,exist_ok=True)
exams=json.loads((root/'data'/'official-exams.json').read_text(encoding='utf-8-sig'))
subject_map={'chinese':('國文',2),'english':('英文',3),'math':('數學',5),'social':('社會',6),'science':('自然',7)}
tips={'國文':'先確認題目問的是文意、寫法或推論，再回到文本找直接證據。','英文':'先抓主詞、時態、連接詞與上下文線索，再排除語意或文法不合的選項。','數學':'先列出已知條件與所求，選擇適用公式，完成後再代回檢查。','自然':'先辨認實驗變因或科學概念，再用題目提供的證據判斷。','社會':'先判斷題目屬於歷史、地理或公民，再以材料中的時間、地點與制度線索作答。'}

def answers(path,col):
    result={}
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            tables=page.extract_tables()
            if not tables: continue
            for row in tables[0][2:]:
                try:q=int((row[0] or '').strip())
                except:continue
                value=(row[col] or '').strip() if len(row)>col else ''
                if value in {'A','B','C','D'}:result[q]=value
    return result

def normalize(text):
    return re.sub(r'[\u2000-\u200f\u2028\u2029\ufeff]', ' ', text or '').replace(' ',' ').replace(' ',' ')

def blocks_for_pdf(path):
    blocks={}; page_texts={}; page_count=0
    with pdfplumber.open(path) as pdf:
        page_count=len(pdf.pages)
        for index,page in enumerate(pdf.pages):
            text=normalize(page.extract_text(x_tolerance=2,y_tolerance=3) or '')
            page_texts[index+1]=text
            matches=list(re.finditer(r'(?m)^\s*(\d{1,2})\s*[\.．]\s+',text))
            for mi,match in enumerate(matches):
                q=int(match.group(1)); end=matches[mi+1].start() if mi+1<len(matches) else len(text)
                block=text[match.start():end].strip()
                if 20<len(block)<6000:blocks[q]={'page':index+1,'text':block}
    return blocks,page_texts,page_count

def nearest_page(q,blocks):
    if q in blocks:return blocks[q]['page']
    known=sorted(blocks)
    lower=[n for n in known if n<q]; upper=[n for n in known if n>q]
    if lower:return blocks[lower[-1]]['page']
    if upper:return blocks[upper[0]]['page']
    return 2

existing=json.loads((root/'data'/'mission-questions.json').read_text(encoding='utf-8-sig'))
similar=[q for q in existing if q.get('type')=='會考類題']
official=[]; serial=1; rendered=set(); report=[]
for exam in sorted(exams,key=lambda x:x['year']):
    year=exam['year']; answer_pdf=cache/f'{year}-answers.pdf'
    for key,(subject,col) in subject_map.items():
        pdf_path=cache/f'{year}-{key}.pdf'; answer_map=answers(answer_pdf,col)
        blocks,page_texts,page_count=blocks_for_pdf(pdf_path)
        pages_needed={nearest_page(q,blocks) for q in answer_map}
        with pdfplumber.open(pdf_path) as pdf:
            for page_no in sorted(pages_needed):
                asset=f'{year}-{key}-p{page_no}.webp'; target=out_assets/asset
                if not target.exists():
                    image=pdf.pages[page_no-1].to_image(resolution=105).original.convert('RGB')
                    image.save(target,'WEBP',quality=72,method=6)
                rendered.add(asset)
        for qnum,letter in sorted(answer_map.items()):
            page=nearest_page(qnum,blocks); raw=blocks.get(qnum,{}).get('text','')
            prompt=f'【{year}年會考{subject}第{qnum}題】\\n'+(raw if raw else f'請查看下方官方試題頁面，作答第 {qnum} 題。')
            prompt=re.sub(r'\n\s*請翻頁繼續作答.*','',prompt,flags=re.S).strip()
            answer='ABCD'.index(letter)
            official.append({'id':f'OFF-{serial:04d}','subject':subject,'gradeSemester':'會考總複習','unit':'歷屆會考','knowledgePoint':f'{year}年{subject}第{qnum}題','difficulty':'進階','type':'歷屆真題','question':prompt,'questionImage':f'./assets/official-exams/{year}-{key}-p{page}.webp','imageAlt':f'{year}年國中教育會考{subject}科第{qnum}題官方試卷頁面','options':['A','B','C','D'],'answer':answer,'explanation':f'官方公布答案為 {letter}。請對照題目條件與選項，確認其餘選項不符合之處。','solutionSteps':[f'閱讀官方題面中的第 {qnum} 題，圈出關鍵條件。','依該科解題方法逐一檢查 A、B、C、D 四個選項。',f'依官方答案表核對，本題答案為 {letter}。'],'teacherTip':tips[subject],'relatedWords':['context clue（上下文線索）','eliminate choices（排除選項）'] if subject=='英文' else [],'sourceType':'官方歷屆真題','source':{'year':year,'questionNumber':qnum,'url':exam['page'],'paperUrl':exam['subjects']['英文閱讀' if subject=='英文' else subject]},'review':{'intervalDays':0,'repetitions':0,'easeFactor':2.5,'lastReviewedAt':None,'nextReviewAt':None}})
            serial+=1
        report.append((year,subject,len(answer_map),len(blocks)))
(root/'data'/'mission-questions.json').write_text(json.dumps(official+similar,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'official':len(official),'similar':len(similar),'images':len(rendered),'report':report},ensure_ascii=False))
