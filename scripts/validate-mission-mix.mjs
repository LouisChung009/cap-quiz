import { readFile } from "node:fs/promises";
const questions=JSON.parse(await readFile(new URL("../data/mission-questions.json",import.meta.url),"utf8"));
for(const subject of ["國文","英文","數學","自然","社會"]){
  const pool=questions.filter(item=>item.subject===subject);
  const official=pool.filter(item=>item.sourceType==="官方歷屆真題");
  const similar=pool.filter(item=>item.type==="會考類題");
  if(official.length<2||similar.length<2)throw new Error(`${subject} 任務配額不足`);
  const mission=[...official.slice(0,2),...similar.slice(0,2)];
  if(new Set(mission.map(item=>item.id)).size!==4)throw new Error(`${subject} 任務題重複`);
  console.log(`${subject}: 任務可固定抽入 2 真題＋2 類題`);
}
console.log("任務真題混排驗證完成。");
