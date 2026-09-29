import fs from 'node:fs';
const path='C:/Users/LOUISCHUNG/.codex/visualizations/2026/09/24/01a0d37c-016f-7ef1-beb0-445cb9311972/cap-quiz/reports/rebuild-english-0001-0100.json';
const data=JSON.parse(fs.readFileSync(path,'utf8'));
const terms={
'0016':['offer（提供／邀請）','decline（婉拒）'],'0017':['apology（道歉）','forgive（原諒）'],'0018':['frequency（頻率）','twice a month（每月兩次）'],'0019':['flat tire（爆胎）','What’s wrong?（哪裡出問題？）'],'0020':['thank（感謝）','gratitude（感激）'],'0021':['suggestion（提議）','That works for me.（我可以／這樣適合我。）'],'0022':['lose（遺失）','sympathy（同情／慰問）'],'0023':['permission（允許）','Of course.（當然可以。）'],'0024':['route（路線）','stop（停靠站）'],'0025':['would like（想要）','apple pie（蘋果派）'],'0026':['agree（同意）','pack（打包）'],'0027':['start（開始）','at 7:30（在七點半）'],'0028':['congratulate（祝賀）','pass an exam（通過考試）'],'0029':['request（請求）','stuffy（悶熱的）'],'0030':['transportation（交通方式）','take the MRT（搭捷運）'],
'0031':['neither（兩者皆非）','singular verb（單數動詞）'],'0032':['past perfect（過去完成式）','by the time（到……時）'],'0033':['relative pronoun（關係代名詞）','non-defining clause（非限定關係子句）'],'0034':['third conditional（第三類條件句）','past perfect（過去完成式）'],'0035':['hardly（幾乎不）','adverb（副詞）'],'0036':['be used to（習慣於）','gerund（動名詞）'],'0037':['furniture（家具；不可數名詞）','passive voice（被動語態）'],'0038':['too…to…（太……而不能……）','infinitive（不定詞）'],'0039':['advise someone to do（建議某人做）','infinitive（不定詞）'],'0040':['despite（儘管）','noun phrase（名詞片語）'],'0041':['modal verb（情態助動詞）','past participle（過去分詞）'],'0042':['inversion（倒裝）','hardly…when（剛……就……）'],'0043':['comparative（比較級）','countable noun（可數名詞）'],'0044':['each（每一個）','subject-verb agreement（主動詞一致）'],'0045':['whose（誰的）','possession（所有關係）'],
'0046':['since（自從）','starting point（起始時間）'],'0049':['connector（連接詞）','concession（讓步）'],'0051':['passive voice（被動語態）','must + be + past participle（必須＋be＋過去分詞）'],'0053':['hardly…when（剛……就……）','subject-auxiliary inversion（主詞與助動詞倒裝）'],'0055':['comparative（比較級）','fewer（較少；接可數名詞）'],'0056':['relative pronoun（關係代名詞）','whose（誰的）'],'0058':['gerund（動名詞）','enjoy + V-ing（喜歡做……）'],'0059':['比較級（comparative）','than（比）'],'0060':['modal（情態助動詞）','base verb（原形動詞）'],'0061':['clue（線索）','context（上下文）'],'0062':['sequence（順序）','next（接著）'],'0064':['cause（原因）','because（因為）'],'0066':['contrast（對比）','but（但是）'],'0067':['purpose（目的）','so that（以便）'],'0068':['result（結果）','as a result（因此）'],'0069':['adverb（副詞）','easily（容易地）'],'0070':['effort（努力）','progress（進步）'],'0072':['landfill（垃圾掩埋場）','repair（修理）'],'0073':['strong enough（足夠強壯）','to-infinitive（不定詞）'],'0074':['allergy（過敏）','reaction（反應）'],
'0076':['library hours（圖書館開放時間）','closing time（閉館時間）'],'0077':['sign-up（報名人數）','difference（差額／差異）'],'0078':['price（價格）','change（找零）'],'0079':['rainfall（降雨量）','millimeter（毫米）'],'0080':['growth（生長量）','centimeter（公分）'],'0081':['break（休息時間）','duration（持續時間）'],'0082':['total cost（總價）','notebook（筆記本）'],'0083':['weight（重量）','kilogram（公斤）'],'0084':['opening hours（營業／開放時間）','weekend（週末）'],'0085':['direction（方向）','block（街區）'],'0086':['delivery（送達）','elapsed time（經過時間）'],'0087':['total（總和）','minute（分鐘）'],'0088':['return（歸還）','difference（差額／差異）'],'0089':['north（北方）','east（東方）'],'0090':['checkout period（借閱期限）','due date（到期日）'],
'0091':['each of（每一個）','subject-verb agreement（主動詞一致）'],'0093':['reported speech（間接引述）','backshift（時態後移）'],'0094':['cause and effect（因果關係）','as a result（因此）'],'0095':['introductory phrase（句首片語）','comma（逗號）'],'0097':['past continuous（過去進行式）','interruption（中斷）'],'0098':['parallel structure（平行結構）','gerund（動名詞）'],'0099':['comparative（比較級）','shorter than（比……短）'],'0100':['should（應該）','base verb（原形動詞）']
};
const chartSteps={
'0076':['Friday closes at 8:00 p.m.; 8:00 − 5:30 = 2 hours 30 minutes.','The correct choice is C, “2.5 hours”; choices A, B, and D do not match that interval.'],
'0077':['Music has 24 sign-ups and Chess has 15; 24 − 15 = 9 students.','The correct choice is B, “9”; 6 is an incorrect subtraction, while 15 and 39 are not the difference.'],
'0078':['The rice bowl and tea cost $85 + $25 = $110; $200 − $110 = $90 change.','The correct choice is B, “$90”; the other amounts do not equal the change after paying $110.'],
'0079':['Thursday has 6 mm of rain; exceeding it by 6 mm means 12 mm, recorded on Wednesday.','The correct choice is B, “Wednesday”; Tuesday is 4 mm, Friday 8 mm, and Monday 0 mm.'],
'0080':['Plant A grew 16 − 12 = 4 cm; Plant B grew 17 − 10 = 7 cm, so Plant B grew 3 cm more than Plant A.','The correct choice is B, “Plant B, by 3 cm”; A grew 4 cm, not 1 or 3 cm, and the growth amounts are not equal.'],
'0081':['The craft class ends at 10:30 and lunch starts at 11:00, so the break is 30 minutes.','The correct choice is B, “30 minutes”; 15, 45, and 60 minutes do not match the time interval.'],
'0082':['Two notebooks cost 2 × $32 = $64; adding the $18 pen gives $82.','The correct choice is C, “$82”; $50 omits an item, $64 is only the notebooks, and $96 is too high.'],
'0083':['Plastic weighs 9 kg and glass 6 kg; together they weigh 9 + 6 = 15 kg.','The correct choice is C, “15 kg”; 11, 14, and 20 kg are not the combined total.'],
'0084':['Saturday is in the weekend schedule, which begins at 8:00; that is the opening time.','The correct choice is B, “8:00”; 6:00 is a weekday opening and 18:00/20:00 are closing times.'],
'0085':['From the station, move 2 blocks east to the park, 1 north to the post office, then 3 west to the school: net 1 west and 1 north.','The correct choice is A, “1 block west and 1 block north”; the other directions do not match the net movement.'],
'0086':['Each order takes three days: Monday to Thursday, Tuesday to Friday, and Wednesday to Saturday.','The correct choice is D, “All three”; no one order took a different number of days.'],
'0087':['Mia exercised 20 + 30 + 25 = 75 minutes; Omar exercised 25 + 25 + 30 = 80 minutes, five minutes longer.','The correct choice is B, “Omar by 5 minutes”; the totals are 75 and 80, not equal.'],
'0088':['Week 4 had 65 returned cups and Week 1 had 40; 65 − 40 = 25 cups.','The correct choice is C, “25”; 15 and 20 are too small, while 65 is the Week 4 count rather than the difference.'],
'0089':['Using the living room as a reference, the kitchen is one unit north; the bathroom is one unit north and one east. From the kitchen, the bathroom is east.','The correct choice is B, “East”; it is neither north nor south of the kitchen, and southeast is not the displacement.'],
'0090':['The borrowing date, April 3, is not counted; seven days later is April 10.','The correct choice is B, “April 10”; April 8 is five days later, while April 24 and 30 exceed seven days.']
};
for(const q of data){
 const n=q.id.slice(-4);
 if(terms[n]) q.relatedWords=terms[n];
 if(chartSteps[n]){
   q.solutionSteps=[`Read the values in the question: “${q.question}”`,...chartSteps[n]];
   q.explanation=`${chartSteps[n][0]} ${chartSteps[n][1]}`;
   q.teacherTip='Compare the exact categories and units in the prompt, then show the arithmetic or direction change before selecting the option.';
 }
}
fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n','utf8');
