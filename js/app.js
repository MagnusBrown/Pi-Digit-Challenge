import { $, cleanUsername, escapeHtml, formatTime, showToast } from "./utils.js";
import { MEDALS, PI_DIGITS } from "./config.js";
import { saveLocalRun, getLocalRuns, exportAllData, importAllData, clearAllGameData } from "./storage.js";
import { Leaderboard } from "./leaderboard.js";
import { PiGame } from "./game.js";
import { ACHIEVEMENTS, unlocked, context, evaluate } from "./achievements.js";
import { getLevelState, awardRunXp } from "./levels.js";

const e = {
  mode:$("mode"),gameType:$("gameType"),customRangeGroup:$("customRangeGroup"),customStart:$("customStart"),customEnd:$("customEnd"),start:$("startBtn"),reset:$("resetBtn"),input:$("digitInput"),
  sound:$("soundToggle"),lives:$("lives"),timer:$("timer"),progressText:$("progressText"),
  accuracy:$("accuracy"),record:$("record"),position:$("position"),modeLine:$("modeLine"),
  recent:$("recentDigits"),ellipsis:$("leadingEllipsis"),marker:$("currentMarker"),hint:$("hint"),
  progressBar:$("progressBar"),grid:$("grid"),leaderboard:$("leaderboard"),status:$("onlineStatus"),
  search:$("searchInput"),refresh:$("refreshBtn"),profileBtn:$("profileBtn"),playerLabel:$("playerLabel"),
  profileStats:$("profileStats"),editProfile:$("editProfileBtn"),profileOverlay:$("profileOverlay"),
  username:$("usernameInput"),profileError:$("profileError"),saveProfile:$("saveProfileBtn"),
  closeProfile:$("closeProfileBtn"),resultOverlay:$("resultOverlay"),resultEmoji:$("resultEmoji"),
  resultTitle:$("resultTitle"),resultText:$("resultText"),resultScore:$("resultScore"),
  resultBadge:$("resultBadge"),resultStats:$("resultStats"),resultBoardInfo:$("resultBoardInfo"),
  reviewGrid:$("reviewGrid"),paceRows:$("paceRows"),paceHeader:$("paceModeHeader"),
  closeResult:$("closeResultBtn"),closeResult2:$("closeResultBtn2"),playAgain:$("playAgainBtn"),
  toast:$("toast"),trainingReveal:$("trainingReveal"),trainingRevealDigits:$("trainingRevealDigits"),
  showBlockBtn:$("showBlockBtn"),profileAvatarBtn:$("profileAvatarBtn"),profileAvatarInitial:$("profileAvatarInitial"),headerLevel:$("headerLevel"),
  headerXpBar:$("headerXpBar"),profileLevel:$("profileLevel"),profileTotalXp:$("profileTotalXp"),
  profileXpBar:$("profileXpBar"),profileXpProgress:$("profileXpProgress"),
  profileXpRemaining:$("profileXpRemaining"),xpResult:$("xpResult"),xpGained:$("xpGained"),
  levelUpText:$("levelUpText"),xpResultBar:$("xpResultBar"),xpResultProgress:$("xpResultProgress"),
  fullProfileOverlay:$("fullProfileOverlay"),closeFullProfile:$("closeFullProfileBtn"),
  fullProfileName:$("fullProfileName"),profileMemberSince:$("profileMemberSince"),
  fullProfileStats:$("fullProfileStats"),bestByMode:$("bestByMode"),achievementCount:$("achievementCount"),
  achievementFilters:$("achievementFilters"),achievementGrid:$("achievementGrid"),recentRuns:$("recentRuns"),
  exportData:$("exportDataBtn"),importData:$("importDataInput"),deleteData:$("deleteDataBtn"),
  achievementOverlay:$("achievementOverlay"),closeAchievement:$("closeAchievementBtn"),
  achievementTitle:$("achievementTitle"),achievementImage:$("achievementImage"),
  achievementRarity:$("achievementRarity"),achievementDescription:$("achievementDescription"),
  achievementStatus:$("achievementStatus"),achievementUnlockInfo:$("achievementUnlockInfo")
};

let profile={username:localStorage.getItem("pi-player-name")||""};
let achievementFilter="All";
if(!localStorage.getItem("pi-profile-created-at"))localStorage.setItem("pi-profile-created-at",new Date().toISOString());


function renderLevelUI(){
  const state=getLevelState();
  e.headerLevel.textContent=`Level ${state.level}`;
  e.headerXpBar.style.width=`${state.progress*100}%`;
  e.profileLevel.textContent=`Level ${state.level}`;
  e.profileTotalXp.textContent=`${state.totalXp.toLocaleString("en-US")} total XP`;
  e.profileXpBar.style.width=`${state.progress*100}%`;
  if(state.level>=state.maxLevel){
    e.profileXpProgress.textContent="Maximum level reached";
    e.profileXpRemaining.textContent="Level 100";
  }else{
    e.profileXpProgress.textContent=`${state.xpIntoLevel.toLocaleString("en-US")} / ${state.xpForNext.toLocaleString("en-US")} XP`;
    e.profileXpRemaining.textContent=`${(state.xpForNext-state.xpIntoLevel).toLocaleString("en-US")} XP to Level ${state.level+1}`;
  }
}
function renderXpResult(xpAward){
  if(!xpAward){e.xpResult.hidden=true;return}
  e.xpResult.hidden=false;
  e.xpGained.textContent=`+${xpAward.gained.toLocaleString("en-US")} XP`;
  e.levelUpText.textContent=xpAward.levelsGained
    ? `Level up! ${xpAward.before.level} → ${xpAward.after.level}`
    : `Level ${xpAward.after.level}`;
  e.xpResultBar.style.width=`${xpAward.after.progress*100}%`;
  e.xpResultProgress.textContent=xpAward.after.level>=100
    ? `${xpAward.after.totalXp.toLocaleString("en-US")} XP · Maximum level`
    : `${xpAward.after.xpIntoLevel.toLocaleString("en-US")} / ${xpAward.after.xpForNext.toLocaleString("en-US")} XP til neste nivå`;
}

function openName(required=false){
  e.profileOverlay.classList.add("show");
  e.profileOverlay.dataset.required=required?"true":"false";
  e.closeProfile.style.display=required?"none":"";
  e.saveProfile.textContent=required?"Choose username":"Save name";
  setTimeout(()=>e.username.focus(),40);
}
function closeName(){
  if(e.profileOverlay.dataset.required==="true"&&!profile.username)return;
  e.profileOverlay.classList.remove("show");
}
function saveName(){
  const username=cleanUsername(e.username.value);
  if(!/^[A-Za-zÆØÅæøå0-9 _-]{3,18}$/.test(username)){e.profileError.textContent="Use 3–18 valid characters.";return}
  profile={username};localStorage.setItem("pi-player-name",username);e.profileError.textContent="";
  e.profileOverlay.dataset.required="false";e.profileOverlay.classList.remove("show");
  updateProfileUI();leaderboard.setProfile(profile);leaderboard.load();loadMiniStats();
  showToast(e.toast,`Player name saved as ${username}.`);
}
function updateProfileUI(){
  e.playerLabel.textContent=profile.username||"choose name";
  e.username.value=profile.username||"Magnus";
}
function myRuns(){return getLocalRuns().filter(r=>r.name===profile.username)}
function medalLabel(value){
  return ({Gull:"Gold",Sølv:"Silver",Bronse:"Bronze",Ingen:"None"}[value]||value||"None");
}
function stats(){
  const runs=myRuns(),attempts=runs.reduce((s,r)=>s+r.score+(r.wrong||0),0),correct=runs.reduce((s,r)=>s+r.score,0);
  return {runs,total:runs.length,completed:runs.filter(r=>r.completed).length,correct,
    accuracy:attempts?correct/attempts*100:100,streak:runs.reduce((m,r)=>Math.max(m,r.longestStreak||0),0),
    best:runs.reduce((m,r)=>Math.max(m,r.score),0),training:runs.filter(r=>r.gameType==="training").reduce((s,r)=>s+r.score,0),
    fastest:runs.reduce((m,r)=>r.fastestTenMs>0?Math.min(m||Infinity,r.fastestTenMs):m,0)};
}
function loadMiniStats(){
  const s=stats();
  e.profileStats.innerHTML=s.total?[
    [s.total,"Runs"],[s.completed,"Completed"],[s.correct,"Total correct"],[`${s.accuracy.toFixed(1)}%`,"Average accuracy"],[s.streak,"Longest streak"],[s.best,"Best score"]
  ].map(([v,l])=>`<div class="miniStat"><b>${v}</b><span>${l}</span></div>`).join(""):'<p class="empty">No statistics yet.</p>';
}
const achievementToastQueue=[];
let achievementToastActive=false;
function showAchievementToast(a){
  achievementToastQueue.push(a);
  if(!achievementToastActive)playNextAchievementToast();
}
function playNextAchievementToast(){
  const a=achievementToastQueue.shift();
  if(!a){achievementToastActive=false;return}
  achievementToastActive=true;
  const box=document.createElement("div");box.className="achievementToast";
  box.innerHTML=`<img src="${a.img}" alt=""><div><b>Achievement unlocked!</b><span>${escapeHtml(a.name)}</span></div>`;
  document.body.appendChild(box);
  requestAnimationFrame(()=>box.classList.add("show"));
  setTimeout(()=>{box.classList.remove("show");setTimeout(()=>{box.remove();playNextAchievementToast()},350)},2500);
}
function formatUnlockDate(value){
  if(!value)return "—";
  return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
}
function modeLabel(run){
  if(run?.custom&&run.startDigit&&run.endDigit)return `digits ${run.startDigit}–${run.endDigit}`;
  return `${run?.total||0} digits`;
}
function openAchievement(a){
  const u=unlocked()[a.id];
  e.achievementTitle.textContent=a.secret&&!u?"Secret achievement":a.name;
  e.achievementImage.src=a.img;e.achievementImage.alt=a.name;
  e.achievementRarity.textContent=a.rarity;e.achievementDescription.textContent=a.secret&&!u?"This achievement remains hidden until you unlock it.":a.desc;
  e.achievementStatus.textContent=u?"Unlocked":"Locked";
  e.achievementUnlockInfo.textContent=u?`Unlocked ${formatUnlockDate(u.unlockedAt)}`:"Keep playing to unlock it.";
  e.achievementOverlay.classList.add("show");
}
function renderAchievements(){
  const u=unlocked(),cats=["All",...new Set(ACHIEVEMENTS.map(a=>a.cat))];
  e.achievementFilters.innerHTML=cats.map(c=>`<button class="achievementFilter ${achievementFilter===c?"active":""}" data-filter="${c}">${c}</button>`).join("");
  e.achievementFilters.querySelectorAll("button").forEach(b=>b.onclick=()=>{achievementFilter=b.dataset.filter;renderAchievements()});
  const list=ACHIEVEMENTS.filter(a=>achievementFilter==="All"||a.cat===achievementFilter);
  e.achievementGrid.innerHTML=list.map(a=>{const ok=!!u[a.id];return `<article class="achievementCard rarity-${a.rarity} ${ok?"":"locked"}" data-id="${a.id}"><img class="achievementBadge" src="${a.img}" alt=""><h4>${a.secret&&!ok?"???":escapeHtml(a.name)}</h4><small>${ok?"Unlocked":"Locked"}</small></article>`}).join("");
  e.achievementGrid.querySelectorAll(".achievementCard").forEach(card=>card.onclick=()=>openAchievement(ACHIEVEMENTS.find(a=>a.id===card.dataset.id)));
  e.achievementCount.textContent=`(${Object.keys(u).length} / ${ACHIEVEMENTS.length})`;
}
function renderResult(run,history=false,xpAward=null){
  e.resultEmoji.textContent=run.gameType==="training"?"🎓":run.completed?"🏆":"💪";
  e.resultTitle.textContent=history?"Run details":run.gameType==="training"?"Training session complete":run.completed?"Challenge complete!":"Run incomplete";
  e.resultText.textContent=run.gameType==="training"?"Training results are recorded without medals.":run.completed?"Excellent work — challenge completed.":"Review your run and try again.";
  e.resultScore.textContent=`${run.score} / ${run.total}`;
  if(run.gameType==="training"){
    e.resultBadge.className="resultBadge trainingResult";
    e.resultBadge.innerHTML="<span>Training</span>";
  }else if(run.completed&&run.medal&&run.medal!=="None"&&run.medal!=="Ingen"){
    const medal=MEDALS.find(item=>item.name===medalLabel(run.medal));
    e.resultBadge.className=`resultBadge medalResult ${medal?.cls||""}`;
    e.resultBadge.innerHTML=`${medal?`<img src="${medal.icon}" alt="">`:""}<span>${escapeHtml(medalLabel(run.medal))}</span>`;
  }else{
    e.resultBadge.className="resultBadge";
    e.resultBadge.innerHTML=`<span>${run.completed?"No medal":`${run.wrong} incorrect ${run.wrong===1?"attempt":"attempts"}`}</span>`;
  }
  const attempts=run.score+(run.wrong||0),accuracy=attempts?run.score/attempts*100:100,pace=run.time/1000/Math.max(1,run.score);
  e.resultStats.innerHTML=[
    ["Score",`${run.score} / ${run.total}`],["Time",formatTime(run.time,true)],["Accuracy",`${accuracy.toFixed(2)}%`],["Incorrect attempts",run.wrong],
    ["Lives remaining",run.gameType==="training"?"—":run.livesRemaining],["Longest streak",run.longestStreak],["Average pace",`${pace.toFixed(2)} sec/digit`],
    ["Digits per minute",(run.digitsPerMinute||0).toFixed(1)],["Fastest 10",run.fastestTenMs?formatTime(run.fastestTenMs,true):"—"],["XP earned",run.xpEarned||"—"],["Level after run",run.levelAfter||"—"],["Block hints used",run.manualHelpCount||0]
  ].map(([l,v])=>`<div class="resultRow"><span>${l}</span><strong>${v}</strong></div>`).join("");
  e.resultBoardInfo.innerHTML=[
    ["Player",run.name],["Game type",run.gameType==="training"?"Training":"Competition"],["Mode",modeLabel(run)],["Status",run.completed?"Completed":"Incomplete"],
    ["Medal",run.gameType==="training"?"None":medalLabel(run.medal)],["Saved",run.finishedAt?new Date(run.finishedAt).toLocaleString("en-US"):"—"]
  ].map(([l,v])=>`<div class="resultRow"><span>${l}</span><strong>${escapeHtml(v)}</strong></div>`).join("");
  e.reviewGrid.innerHTML="";const f=document.createDocumentFragment();
  for(let i=0;i<run.total;i++){const c=document.createElement("div");c.className=`reviewCell ${i<run.score?"correct":"untried"}`;c.textContent=PI_DIGITS[(run.startDigit?run.startDigit-1:0)+i];f.appendChild(c)}e.reviewGrid.appendChild(f);
  e.paceHeader.textContent=`Target time for ${run.total} digits`;
  e.paceRows.innerHTML=run.gameType==="training"?
    '<tr><td colspan="3">Training mode does not award medals.</td></tr>':
    MEDALS.map(m=>`<tr class="medalPaceRow ${m.cls}">
      <td><span class="medalName"><img src="${m.icon}" alt=""><strong>${m.name}</strong></span></td>
      <td><span class="comparisonValue">${m.pace.toFixed(2)} sec/digit or faster</span></td>
      <td><span class="comparisonValue">${formatTime(m.pace*run.total*1000,true)} or faster</span></td>
    </tr>`).join("");
  renderXpResult(history?null:xpAward);e.playAgain.style.display=history?"none":"";e.resultOverlay.classList.add("show");
}
function openFullProfile(){
  const s=stats(),runs=s.runs,levelState=getLevelState();
  e.fullProfileName.textContent=profile.username;e.profileMemberSince.textContent=`Profile since ${new Date(localStorage.getItem("pi-profile-created-at")).toLocaleDateString("en-US")}`;
  e.fullProfileStats.innerHTML=[[levelState.level,"Level"],[levelState.totalXp.toLocaleString("en-US"),"Total XP"],[s.total,"Total runs"],[s.completed,"Completed"],[s.correct,"Total correct"],[`${s.accuracy.toFixed(1)}%`,"Accuracy"],[s.streak,"Longest streak"],[s.fastest?formatTime(s.fastest,true):"—","Fastest 10"],[s.training,"Training digits"],[Object.keys(unlocked()).length,"Achievements"]].map(([v,l])=>`<div class="miniStat"><b>${v}</b><span>${l}</span></div>`).join("");
  e.bestByMode.innerHTML=[20,50,100,200,400,750,1000].map(mode=>{const mr=runs.filter(r=>r.total===mode&&(r.gameType||"competition")==="competition"),done=mr.filter(r=>r.completed).sort((a,b)=>a.time-b.time)[0],best=mr.sort((a,b)=>b.score-a.score||a.time-b.time)[0];return `<div class="bestModeRow"><strong>${mode}</strong><span>${done?formatTime(done.time,true):"Not completed"}</span><span>${best?`${best.score}/${mode}`:"—"}</span><span>${done?.medal?medalLabel(done.medal):"—"}</span></div>`}).join("");
  e.recentRuns.innerHTML=runs.slice(0,12).map(r=>`<div class="recentRunRow" data-id="${r.id}"><strong>${r.gameType==="training"?"Training":"Competition"} ${r.custom?`${r.startDigit}–${r.endDigit}`:r.total}</strong><span>${r.score}/${r.total}</span><span>${formatTime(r.time,true)}</span><span>${new Date(r.finishedAt).toLocaleDateString("en-US")}</span></div>`).join("")||'<p class="empty">No runs yet.</p>';
  e.recentRuns.querySelectorAll(".recentRunRow").forEach(row=>row.onclick=()=>{const r=getLocalRuns().find(x=>x.id===row.dataset.id);if(r){e.fullProfileOverlay.classList.remove("show");renderResult(r,true)}});
  renderLevelUI();renderAchievements();e.fullProfileOverlay.classList.add("show");
}

function updateCustomRangeUI(){
  const training=e.gameType.value==="training";
  [...e.mode.options].forEach(option=>{if(option.value==="custom")option.disabled=!training});
  if(!training&&e.mode.value==="custom")e.mode.value="100";
  const custom=training&&e.mode.value==="custom";
  if(e.customRangeGroup)e.customRangeGroup.hidden=!custom;
}
updateCustomRangeUI();

const leaderboard=new Leaderboard({profile,elements:e,onRunSelect:r=>renderResult(r,true)});
const game=new PiGame(e,{
  canStart:()=>!!profile.username,
  requireProfile:()=>{openName(true);showToast(e.toast,"Choose and save a player name before starting.",true)},
  getPlayerName:()=>profile.username||"Player",
  onFinish:async run=>{
    const oldBest=getLocalRuns().filter(r=>(r.gameType||"competition")==="competition"&&r.total===run.total&&r.completed).sort((a,b)=>a.time-b.time)[0];
    const xpAward=awardRunXp(run);
    run.xpEarned=xpAward.gained;
    run.levelAfter=xpAward.after.level;
    saveLocalRun(run);
    const fresh=evaluate(context(run,{
      newPersonalBest:run.gameType==="competition"&&run.completed&&(!oldBest||run.time<oldBest.time),
      level:xpAward.after.level
    }));
    fresh.forEach(a=>showAchievementToast(a));
    renderResult(run,false,xpAward);renderLevelUI();
    leaderboard.type=run.completed?"completed":"failed";await leaderboard.load();loadMiniStats();
    showToast(e.toast,"Your result has been saved in this browser.");
  }
});

e.status.textContent="Local save";e.status.className="status online";
e.input.oninput=()=>game.submit(e.input.value.slice(-1));e.start.onclick=()=>game.start();e.reset.onclick=()=>game.reset();
e.mode.onchange=async()=>{updateCustomRangeUI();game.reset();await leaderboard.load()};e.gameType.onchange=async()=>{updateCustomRangeUI();game.reset();await leaderboard.load()};[e.customStart,e.customEnd].forEach(input=>input&&(input.onchange=()=>{game.reset()}));
e.showBlockBtn.onclick=()=>game.showTrainingBlock(true);e.profileAvatarBtn.onclick=openFullProfile;e.profileBtn.onclick=()=>openName(false);e.editProfile.onclick=openFullProfile;
e.closeProfile.onclick=closeName;e.saveProfile.onclick=saveName;e.username.onkeydown=x=>{if(x.key==="Enter")saveName()};
document.querySelectorAll(".boardTab").forEach(b=>b.onclick=async()=>{leaderboard.type=b.dataset.board;await leaderboard.load()});
let timer;e.search.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>leaderboard.load(),300)};e.refresh.onclick=()=>leaderboard.load();
[e.closeResult,e.closeResult2].forEach(b=>b.onclick=()=>e.resultOverlay.classList.remove("show"));e.playAgain.onclick=()=>{e.resultOverlay.classList.remove("show");game.start()};
e.closeFullProfile.onclick=()=>e.fullProfileOverlay.classList.remove("show");e.closeAchievement.onclick=()=>e.achievementOverlay.classList.remove("show");
e.exportData.onclick=()=>{const blob=new Blob([JSON.stringify(exportAllData(),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`pi-digit-profile-${Date.now()}.json`;a.click();URL.revokeObjectURL(a.href)};
e.importData.onchange=async x=>{try{importAllData(JSON.parse(await x.target.files[0].text()));location.reload()}catch{showToast(e.toast,"The data file could not be imported.",true)}};
e.deleteData.onclick=()=>{if(confirm("This permanently deletes your profile, runs, records, and achievements. Continue?")){clearAllGameData();location.reload()}};
window.addEventListener("keydown",x=>{if(x.key==="Escape"){e.resultOverlay.classList.remove("show");e.fullProfileOverlay.classList.remove("show");e.achievementOverlay.classList.remove("show");closeName()}});
updateProfileUI();renderLevelUI();leaderboard.load();loadMiniStats();if(!profile.username){e.username.value="Magnus";openName(true)}
