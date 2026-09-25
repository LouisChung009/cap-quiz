let students=[
{id:"S-1042",name:"星星",avatar:"星",color:"#ffe29a",today:28,accuracy:86,streak:12,weak:"英文文法",last:"8 分鐘前",status:"active",total:642,minutes:34,wrong:["現在簡單式","介系詞","語意轉折"]},
{id:"S-1088",name:"小樹",avatar:"樹",color:"#ccebb8",today:20,accuracy:74,streak:5,weak:"數學代數",last:"21 分鐘前",status:"attention",total:381,minutes:27,wrong:["一元一次方程式","比例式"]},
{id:"S-1126",name:"晴晴",avatar:"晴",color:"#bfe6f6",today:35,accuracy:92,streak:21,weak:"社會歷史",last:"36 分鐘前",status:"active",total:1034,minutes:46,wrong:["清領初期","工業革命"]},
{id:"S-1171",name:"阿橘",avatar:"橘",color:"#ffd0b8",today:8,accuracy:48,streak:1,weak:"自然理化",last:"2 小時前",status:"attention",total:96,minutes:11,wrong:["串聯電路","化學變化","酸鹼判斷"]},
{id:"S-1204",name:"月芽",avatar:"月",color:"#ddd2f4",today:0,accuracy:81,streak:0,weak:"國文閱讀",last:"3 天前",status:"inactive",total:218,minutes:0,wrong:["主旨判斷","篇章結構"]},
{id:"S-1259",name:"小海",avatar:"海",color:"#b9e8e3",today:18,accuracy:79,streak:8,weak:"數學幾何",last:"1 小時前",status:"active",total:557,minutes:25,wrong:["三角形內角","矩形面積"]},
{id:"S-1303",name:"米米",avatar:"米",color:"#f2d2dc",today:12,accuracy:63,streak:2,weak:"英文閱讀",last:"4 小時前",status:"attention",total:173,minutes:19,wrong:["閱讀推論","時間判讀"]},
{id:"S-1340",name:"豆豆",avatar:"豆",color:"#dce9aa",today:24,accuracy:88,streak:16,weak:"自然地科",last:"17 分鐘前",status:"active",total:789,minutes:31,wrong:["四季成因","地震規模"]}
];
const trend=[{d:"四",u:436,q:6812},{d:"五",u:472,q:7440},{d:"六",u:391,q:5902},{d:"日",u:518,q:8234},{d:"一",u:547,q:9018},{d:"二",u:581,q:9640},{d:"三",u:612,q:10284}];
const subjects=[{n:"國文",v:78,c:"#ff765f"},{n:"英文",v:71,c:"#5faad9"},{n:"數學",v:69,c:"#ffbf3f"},{n:"自然",v:75,c:"#62a66a"},{n:"社會",v:82,c:"#8b78c9"}];
let metrics=[{l:"平台學生",v:"1,284",s:"本週新增 36 人",c:"#e7f5d8"},{l:"今日活躍",v:"612",s:"47.7% 活躍率",c:"#ddecf4"},{l:"今日完成題數",v:"10,284",s:"平均每人 16.8 題",c:"#fff0c9"},{l:"今日平均正確率",v:"74.8%",s:"較昨日 +1.6%",c:"#ffe2da"}];
const statusText={active:"學習中",attention:"需關注",inactive:"未開始"};
const config=window.CAP_QUIZ_ADMIN_CONFIG||{mode:"demo"};
const views={
  overview:{kicker:"平台營運總覽",title:"今天，每個孩子都走到哪裡了？"},
  students:{kicker:"學生狀態",title:"從每日小步驟看見每個人的節奏"},
  trends:{kicker:"學習趨勢",title:"題量之外，也看學習品質的變化"},
  attention:{kicker:"需要關注",title:"先理解卡關，再給合適的幫助"}
};
const metricGrid=document.querySelector("#metricGrid"),studentRows=document.querySelector("#studentRows"),dialog=document.querySelector("#studentDialog"),detail=document.querySelector("#studentDetail");
document.querySelector("#reportDate").textContent=new Intl.DateTimeFormat("zh-TW",{dateStyle:"full"}).format(new Date())+"・資料每 5 分鐘更新";
function renderMetrics(){metricGrid.innerHTML=metrics.map(x=>`<article class="metric" style="--accent:${x.c}"><small>${x.l}</small><strong>${x.v}</strong><em>${x.s}</em></article>`).join("")}
renderMetrics();
const maxQ=Math.max(...trend.map(x=>x.q));document.querySelector("#trendChart").innerHTML=trend.map(x=>`<div class="day-column"><i class="bar users" style="height:${x.u/650*78}%" title="${x.u} 人"></i><i class="bar questions" style="height:${x.q/maxQ*96}%" title="${x.q} 題"></i><span class="day-label">${x.d}</span></div>`).join("");
document.querySelector("#subjectBars").innerHTML=subjects.map(x=>`<div class="subject-row"><span>${x.n}</span><div class="subject-track"><div class="subject-fill" style="width:${x.v}%;background:${x.c}"></div></div><output>${x.v}%</output></div>`).join("");
document.querySelector("#alertGrid").innerHTML=`<article class="alert-card red"><span class="alert-icon">◒</span><div><b>38 人連續 3 天未刷題</b><p>建議發送溫和提醒，不公開排名。</p></div></article><article class="alert-card amber"><span class="alert-icon">△</span><div><b>27 人正確率低於 50%</b><p>優先檢查是否卡在同一知識點。</p></div></article><article class="alert-card blue"><span class="alert-icon">↻</span><div><b>64 人累積 10 題以上錯題</b><p>可安排錯題複習任務。</p></div></article>`;
function renderRows(){const query=document.querySelector("#searchInput").value.trim().toLowerCase(),status=document.querySelector("#statusFilter").value;const filtered=students.filter(x=>(status==="all"||x.status===status)&&(`${x.name}${x.id}`.toLowerCase().includes(query)));studentRows.innerHTML=filtered.map(x=>`<tr data-id="${x.id}"><td><div class="student"><span class="avatar" style="background:${x.color}">${x.avatar}</span><div><b>${x.name}</b><small>${x.id}</small></div></div></td><td><b>${x.today} 題</b><div class="progress-mini"><i style="width:${Math.min(x.today/20*100,100)}%"></i></div></td><td>${x.accuracy}%</td><td>🔥 ${x.streak} 天</td><td>${x.weak}</td><td>${x.last}</td><td><span class="status ${x.status}">● ${statusText[x.status]}</span></td></tr>`).join("");studentRows.querySelectorAll("tr").forEach(row=>row.addEventListener("click",()=>openDetail(students.find(x=>x.id===row.dataset.id))))}
function openDetail(x){const heat=Array.from({length:28},(_,i)=>`<i data-level="${i%7===0?0:(i*x.id.charCodeAt(2))%4}" title="第 ${i+1} 天"></i>`).join("");detail.innerHTML=`<div class="detail"><p class="kicker">${x.id}・匿名學習檔案</p><h2>${x.name}的學習紀錄</h2><p class="detail-meta">只顯示學習必要資料；真實姓名與聯絡資訊預設不出現在分析看板。</p><div class="detail-grid"><div class="detail-stat"><strong>${x.today}</strong><span>今日完成題數</span></div><div class="detail-stat"><strong>${x.accuracy}%</strong><span>近 30 日正確率</span></div><div class="detail-stat"><strong>${x.minutes}</strong><span>今日有效分鐘</span></div><div class="detail-stat"><strong>${x.total}</strong><span>累計完成題數</span></div><div class="detail-stat"><strong>${x.streak}</strong><span>連續學習天數</span></div><div class="detail-stat"><strong>${x.wrong.length}</strong><span>近期弱點數</span></div></div><section class="detail-section"><h3>近 28 日學習熱度</h3><div class="heatmap">${heat}</div></section><section class="detail-section"><h3>需要加強的知識點</h3><div class="weak-list">${x.wrong.map(w=>`<span>${w}</span>`).join("")}</div></section></div>`;dialog.showModal()}
document.querySelector("#searchInput").addEventListener("input",renderRows);
document.querySelector("#statusFilter").addEventListener("change",renderRows);
document.querySelector("#closeDialog").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
function showView(view){
  const selected=views[view]||views.overview;
  document.querySelectorAll("[data-panel]").forEach(panel=>panel.classList.toggle("hidden-panel",!panel.dataset.panel.split(" ").includes(view)));
  document.querySelectorAll(".nav-item[data-view]").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
  document.querySelector("#pageKicker").textContent=selected.kicker;
  document.querySelector("#pageTitle").textContent=selected.title;
  history.replaceState(null,"",`#${view}`);
}
document.querySelectorAll(".nav-item[data-view]").forEach(button=>button.addEventListener("click",()=>showView(button.dataset.view)));
document.querySelector("#showAllAlerts").addEventListener("click",()=>showView("attention"));
if(config.mode==="supabase"&&!sessionStorage.getItem("capQuizAdminSession"))location.replace("./login.html");
if(config.mode!=="demo")document.querySelector("#demoBanner").classList.add("hidden-panel");
async function loadLiveDashboard(){
  if(config.mode!=="supabase")return;
  const session=JSON.parse(sessionStorage.getItem("capQuizAdminSession")||"null");
  if(!session?.accessToken||session.expiresAt<Date.now())return location.replace("./login.html");
  const response=await fetch(`${config.supabaseUrl}/functions/v1/admin-dashboard`,{headers:{Authorization:`Bearer ${session.accessToken}`,apikey:config.supabaseAnonKey}});
  if(!response.ok)throw new Error("無法載入管理資料，請確認管理員權限與 Edge Function 設定。");
  const data=await response.json(),summary=data.summary||{};
  metrics=[
    {l:"平台學生",v:Number(summary.studentCount||0).toLocaleString(),s:"已註冊學生",c:"#e7f5d8"},
    {l:"今日活躍",v:Number(summary.activeCount||0).toLocaleString(),s:"今日至少完成 1 題",c:"#ddecf4"},
    {l:"今日完成題數",v:Number(summary.answeredCount||0).toLocaleString(),s:"以伺服器時間統計",c:"#fff0c9"},
    {l:"今日平均正確率",v:`${summary.accuracy||0}%`,s:"已同步作答紀錄",c:"#ffe2da"}
  ];
  students=(data.students||[]).map(item=>{const profile=Array.isArray(item.profiles)?item.profiles[0]:item.profiles||{};const accuracy=item.answered_count?Math.round(item.correct_count/item.answered_count*100):0;return{id:profile.public_code||item.user_id,name:profile.display_name||"匿名學生",avatar:(profile.display_name||"學").slice(0,1),color:"#dce9aa",today:item.answered_count||0,accuracy,streak:0,weak:"待同步弱點",last:item.last_activity_at?new Date(item.last_activity_at).toLocaleString("zh-TW"):"尚無紀錄",status:item.answered_count?"active":"inactive",total:item.answered_count||0,minutes:0,wrong:item.weakest_points||[]}});
  renderMetrics();renderRows();
}
renderRows();showView(location.hash.slice(1)||"overview");
loadLiveDashboard().catch(error=>{document.querySelector("#demoBanner").classList.remove("hidden-panel");document.querySelector("#demoBanner").innerHTML=`<b>資料載入失敗</b> ${error.message}`});
