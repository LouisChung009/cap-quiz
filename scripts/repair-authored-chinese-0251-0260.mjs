import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0251": { unit: "文言文", teacherTip: "「省」有探望、節省等義；本句以「吾身」為檢查對象，應依反覆檢視自身言行來判斷。" },
  "CHI-0252": { unit: "文言文", teacherTip: "理解「己所不欲，勿施於人」時把前後兩個「己／人」對照，掌握由自身感受推及他人的倫理原則。" },
  "CHI-0253": { unit: "文言文", teacherTip: "比較「學」與「思」兩個分句的後果，才能看出句子不是只偏重一方，而是主張兩者相互補足。" },
  "CHI-0254": {
    unit: "文言文",
    knowledgePoint: "通假字與詞義推論",
    explanation: "前兩個「知」指知道，末句「是知也」的「知」通「智」，意為明智；能誠實分辨已知與未知，才是真正的智慧。 正確答案：C「明智」。",
    solutionSteps: ["比較前面的「知之」和句末「是知也」在句中的功能。", "末句的「知」通「智」，總結前述誠實面對所知與未知的態度。", "此處指明智，選C。"],
    teacherTip: "辨認通假與詞義時看字在句中的功能；本句前兩個「知」是知道，句末一字則通「智」，概括為明智。",
  },
  "CHI-0255": { unit: "文言文", teacherTip: "「必有我師」不是說同行者都具有教師身分，而是從每個人的言行中找出可學習之處。" },
  "CHI-0256": { unit: "文言文", teacherTip: "讀對比句先分別解釋「坦蕩蕩」和「長戚戚」的情緒色彩，再由兩端差異概括君子與小人的心境。" },
  "CHI-0257": { unit: "詩詞閱讀", teacherTip: "讀景物詩時把顏色詞和感官動詞分類；「黃、翠、白、青」提供視覺，「鳴」加入聽覺。" },
  "CHI-0258": { unit: "詩詞閱讀", teacherTip: "解讀「關不住」不要停在園牆是否牢固；結合紅杏探出牆外的畫面，推論春意外溢的象徵。" },
  "CHI-0259": { unit: "詩詞閱讀", teacherTip: "送別詩常以目送動作含蓄寫情；追蹤「孤帆」消失後詩人仍看見什麼，推論離情。" },
  "CHI-0260": { unit: "詩詞閱讀", teacherTip: "古詩詞的「坐」可能作原因詞；把「停車」和「愛楓林晚」連成因果，確認不是坐下或乘坐。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
