import fs from "node:fs";

const file = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const repairs = new Map([
  ["OFF-0419", { answer: 3, explanation: "答案 D。圖中食物鏈為植物→鼠→蛇→鷹，能量塔由下而上依序是甲、乙、丙、丁；蛇位於丙層，能量約 10,000 單位。能量傳遞到下一營養階層時僅約一成可供下一層利用，因此下一層乙（鼠）的總能量約為蛇的十倍，即 100,000 單位。" }],
  ["OFF-0420", { answer: 1, explanation: "答案 B。依原卷地面天氣圖，呂宋島北部位於天氣系統乙附近；北半球低壓周圍近地面風呈反時針並向低壓中心輻合，配合圖示等壓線方向，當地風向可判為北風或東北風。甲的影響與雨勢分布不能支持 A、C；熱帶氣旋移至呂宋島上方也不會使當地必然晴朗炎熱，D 不成立。" }],
  ["OFF-0421", { answer: 3, explanation: "答案 D。速度—時間圖中乙、丁兩車的速度差在 t＞0 時持續存在，兩車位移差會隨時間累積，因此車距愈來愈遠。甲、乙的速度不相同，距離不會保持不變；丙、丁也不是等速同向，兩者車距不固定。判斷車距須比較速度差，而不是只看某一時刻速度大小。" }],
  ["OFF-0422", { answer: 3, explanation: "答案 D。血液離開肺臟後含氧量高，進入左心室再由主動脈送往全身；血液離開身體組織後含氧量較低，進入右心室並由肺動脈送往肺臟。表中乙心室的氧含量 15.2 ml/100 ml 低於甲的 19.8，故乙最可能連接肺動脈。" }],
  ["OFF-0423", { answer: 1, explanation: "答案 B。以表（六）的每度電排碳量加權比較發電組成，燃煤約 790 g、燃氣約 380 g，核能與再生能源接近 0。圖中甲、乙兩國 2030 年都降低燃煤比例並提高再生能源比例；其餘燃料比例的變化不足以抵銷這個方向，所以兩國平均每度電的碳排放量都會下降。" }],
  ["OFF-0424", { answer: 1, explanation: "答案 B。相同熱源每分鐘供給相同熱量，忽略散熱與蒸發時，水的升溫速率滿足 ΔT/t = P/(mc)，與水的質量 m 成反比。甲、乙質量比為 3:2，因此甲的升溫斜率應是乙的 2/3；兩杯都從 0°C 升溫起算，符合此斜率關係的圖為 B。" }],
  ["OFF-0425", { answer: 0, explanation: "答案 A。水車攪動可增加空氣與水的接觸，使溶氧量上升；熟石灰 Ca(OH)₂ 溶於水會提供 OH⁻，中和酸性、提高 pH。兩項處理都使題目所列指標增加，因此是「溶氧量增加、pH 值增加」。" }],
  ["OFF-0426", { answer: 0, explanation: "答案 A。鋅銅電池中鋅較容易失去電子，在鋅電極氧化成 Zn²⁺；電子經外電路流向銅電極，銅離子在銅電極得到電子並析出銅：Cu²⁺ + 2e⁻ → Cu。圖中乙為銅電極，因此應選還原反應 A，而不是鋅的氧化或其他金屬反應。" }],
  ["OFF-0427", { answer: 2, explanation: "答案 C。三種粒子中質量最小的是電子，所以 X 為電子。C 所述陰離子滿足 Nₓ=Nᵧ>N_z，若 Z 為質子，則 Y 為中子；電子數與中子數相等且多於質子數，故帶負電，符合陰離子。D 將 Z 說成電子，與 X 已是電子矛盾；A、B 所列帶正電條件也不符合所述粒子數關係。" }],
  ["OFF-0428", { answer: 2, explanation: "答案 C。碘液遇到澱粉會呈藍黑色；沒有檢測到澱粉時維持黃褐色。甲呈藍黑色，表示仍有澱粉，應是加入水的對照組；乙呈黃褐色，表示澱粉被蜂蜜中的澱粉酶分解，所以加入蜂蜜的是乙。" }],
  ["OFF-0429", { answer: 0, explanation: "答案 A。第一支槓桿兩個力大小皆為 F，力臂各 20 cm；雖然兩力方向相反，但分別作用於支點兩側，造成的轉動方向相同，所以 L₁=F×20+F×20=40F。第二支槓桿的力臂為 40 cm，L₂=F×40=40F，因此 L₁=L₂。注意兩力的合力為零，不代表合力矩為零。" }],
]);

for (const [id, repair] of repairs) {
  const item = questions.find(question => question.id === id);
  if (!item) throw new Error(`Missing ${id}`);
  if (item.source?.year !== 111 || item.subject !== "自然" || item.answer !== repair.answer) {
    throw new Error(`Unexpected official source or answer index for ${id}`);
  }
  item.explanation = repair.explanation;
}

fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Repaired ${repairs.size} official 111 science explanations.`);
