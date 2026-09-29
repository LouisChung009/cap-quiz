import fs from 'node:fs';

const file = new URL('../data/social.json', import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, 'utf8'));
const question = questions.find(({ id }) => id === 'SOC-0112');

if (!question) throw new Error('SOC-0112 not found');
if (question.question !== '【地理｜資料】某縣市年雨量約2,500毫米，夏季降雨集中，冬季較乾；另一縣市全年降雨較平均，冬季仍常有降雨。前者較可能位於臺灣何處？') {
  throw new Error('SOC-0112 stem changed; refusing to patch');
}

question.answer = 0;
question.explanation = '題幹描述前者夏季降雨集中、冬季較乾，符合臺灣西南部受夏季西南氣流及午後對流降雨影響、冬季處於背風側的特徵；北部或東北部冬季常受東北季風降雨，與題幹相反。正確答案：A「西南部沿海」。';
question.solutionSteps = [
  '題目問的是「前者」：年雨量約2,500毫米，夏雨集中且冬季較乾。',
  '臺灣北部與東北部冬季受東北季風影響，常有降雨；這符合題幹所述的另一縣市，而非前者。',
  '前者的夏雨、冬乾型態符合西南部沿海，因此選A。',
];

fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
