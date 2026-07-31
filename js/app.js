import { $, cleanUsername, escapeHtml, formatTime, showToast } from "./utils.js";
import { MEDALS, PI_DIGITS } from "./config.js";
import { saveLocalRun, getLocalRuns, exportAllData, importAllData, clearAllGameData } from "./storage.js";
import { Leaderboard } from "./leaderboard.js";
import { PiGame } from "./game.js";
import { ACHIEVEMENTS, unlocked, context, evaluate } from "./achievements.js";
import { getLevelState, awardRunXp } from "./levels.js";

const e = {
  mode:$("mode"),gameType:$("gameType"),start:$("startBtn"),reset:$("resetBtn"),input:$("digitInput"),
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
  showBlockBtn:$("showBlockBtn"),levelBtn:$("levelBtn"),headerLevel:$("headerLevel"),
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
let achievementFilter="Alle";
if(!localStorage.getItem("pi-profile-created-at"))localStorage.setItem("pi-profile-created-at",new Date().toISOString());


function renderLevelUI(){
  const state=getLevelState();
  e.headerLevel.textContent=`Nivå ${state.level}`;
  e.headerXpBar.style.width=`${state.progress*100}%`;
  e.profileLevel.textContent=`Nivå ${state.level}`;
  e.profileTotalXp.textContent=`${state.totalXp.toLocaleString("no-NO")} XP totalt`;
  e.profileXpBar.style.width=`${state.progress*100}%`;
  if(state.level>=state.maxLevel){
    e.profileXpProgress.textContent="Maksnivå nådd";
    e.profileXpRemaining.textContent="Nivå 100";
  }else{
    e.profileXpProgress.textContent=`${state.xpIntoLevel.toLocaleString("no-NO")} / ${state.xpForNext.toLocaleString("no-NO")} XP`;
    e.profileXpRemaining.textContent=`${(state.xpForNext-state.xpIntoLevel).toLocaleString("no-NO")} XP til nivå ${state.level+1}`;
  }
}
function renderXpResult(xpAward){
  if(!xpAward){e.xpResult.hidden=true;return}
  e.xpResult.hidden=false;
  e.xpGained.textContent=`+${xpAward.gained.toLocaleString("no-NO")} XP`;
  e.levelUpText.textContent=xpAward.levelsGained
    ? `Nivå opp! ${xpAward.before.level} → ${xpAward.after.level}`
    : `Nivå ${xpAward.after.level}`;
  e.xpResultBar.style.width=`${xpAward.after.progress*100}%`;
  e.xpResultProgress.textContent=xpAward.after.level>=100
    ? `${xpAward.after.totalXp.toLocaleString("no-NO")} XP · Maksnivå`
    : `${xpAward.after.xpIntoLevel.toLocaleString("no-NO")} / ${xpAward.after.xpForNext.toLocaleString("no-NO")} XP til neste nivå`;
}

function openName(required=false){
  e.profileOverlay.classList.add("show");
  e.profileOverlay.dataset.required=required?"true":"false";
  e.closeProfile.style.display=required?"none":"";
  e.saveProfile.textContent=required?"Velg brukernavn":"Lagre navn";
  setTimeout(()=>e.username.focus(),40);
}
function closeName(){
  if(e.profileOverlay.dataset.required==="true"&&!profile.username)return;
  e.profileOverlay.classList.remove("show");
}
function saveName(){
  const username=cleanUsername(e.username.value);
  if(!/^[A-Za-zÆØÅæøå0-9 _-]{3,18}$/.test(username)){e.profileError.textContent="Bruk 3–18 gyldige tegn.";return}
  profile={username};localStorage.setItem("pi-player-name",username);e.profileError.textContent="";
  e.profileOverlay.dataset.required="false";e.profileOverlay.classList.remove("show");
  updateProfileUI();leaderboard.setProfile(profile);leaderboard.load();loadMiniStats();
  showToast(e.toast,`Spillernavn lagret som ${username}.`);
}
function updateProfileUI(){
  e.playerLabel.textContent=profile.username||"velg navn";
  e.username.value=profile.username||"Magnus";
}
function myRuns(){return getLocalRuns().filter(r=>r.name===profile.username)}
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
    [s.total,"Forsøk"],[s.completed,"Fullførte"],[s.correct,"Riktige totalt"],[`${s.accuracy.toFixed(1)}%`,"Snittnøyaktighet"],[s.streak,"Lengste streak"],[s.best,"Beste poeng"]
  ].map(([v,l])=>`<div class="miniStat"><b>${v}</b><span>${l}</span></div>`).join(""):'<p class="empty">Ingen statistikk ennå.</p>';
}
function showAchievementToast(a){
  const box=document.createElement("div");box.className="achievementToast";
  box.innerHTML=`<img src="${a.img}" alt=""><div><b>Achievement låst opp!</b><span>${escapeHtml(a.name)}</span></div>`;
  document.body.appendChild(box);requestAnimationFrame(()=>box.classList.add("show"));
  setTimeout(()=>{box.classList.remove("show");setTimeout(()=>box.remove(),300)},4200);
}
function openAchievement(a){
  const u=unlocked()[a.id];
  e.achievementTitle.textContent=a.secret&&!u?"Hemmelig achievement":a.name;
  e.achievementImage.src=a.img;e.achievementImage.alt=a.name;
  e.achievementRarity.textContent=a.rarity;e.achievementDescription.textContent=a.secret&&!u?"Dette achievementet er hemmelig til du låser det opp.":a.desc;
  e.achievementStatus.textContent=u?"✅ Låst opp":"🔒 Ikke låst opp";
  e.achievementUnlockInfo.textContent=u?`Låst opp ${new Date(u.unlockedAt).toLocaleString("no-NO")}`:"Fortsett å spille for å låse det opp.";
  e.achievementOverlay.classList.add("show");
}
function renderAchievements(){
  const u=unlocked(),cats=["Alle",...new Set(ACHIEVEMENTS.map(a=>a.cat))];
  e.achievementFilters.innerHTML=cats.map(c=>`<button class="achievementFilter ${achievementFilter===c?"active":""}" data-filter="${c}">${c}</button>`).join("");
  e.achievementFilters.querySelectorAll("button").forEach(b=>b.onclick=()=>{achievementFilter=b.dataset.filter;renderAchievements()});
  const list=ACHIEVEMENTS.filter(a=>achievementFilter==="Alle"||a.cat===achievementFilter);
  e.achievementGrid.innerHTML=list.map(a=>{const ok=!!u[a.id];return `<article class="achievementCard rarity-${a.rarity} ${ok?"":"locked"}" data-id="${a.id}"><img class="achievementBadge" src="${a.img}" alt=""><h4>${a.secret&&!ok?"???":escapeHtml(a.name)}</h4><small>${ok?"Låst opp":"Låst"}</small></article>`}).join("");
  e.achievementGrid.querySelectorAll(".achievementCard").forEach(card=>card.onclick=()=>openAchievement(ACHIEVEMENTS.find(a=>a.id===card.dataset.id)));
  e.achievementCount.textContent=`(${Object.keys(u).length} / ${ACHIEVEMENTS.length})`;
}
function renderResult(run,history=false,xpAward=null){
  e.resultEmoji.textContent=run.gameType==="training"?"🎓":run.completed?"🏆":"💪";
  e.resultTitle.textContent=history?"Løpsdetaljer":run.gameType==="training"?"Treningsøkt ferdig":run.completed?"Modus fullført!":"Løpet ble ikke fullført";
  e.resultText.textContent=run.gameType==="training"?"Treningsresultat uten medalje.":run.completed?"Fullført løp.":"Mislykket løp.";
  e.resultScore.textContent=`${run.score} / ${run.total}`;
  e.resultBadge.textContent=run.gameType==="training"?"Trening":run.completed?(run.medal&&run.medal!=="Ingen"?`🏅 ${run.medal}`:"Ingen medalje"):`${run.wrong} feilforsøk`;
  const attempts=run.score+(run.wrong||0),accuracy=attempts?run.score/attempts*100:100,pace=run.time/1000/Math.max(1,run.score);
  e.resultStats.innerHTML=[
    ["Poeng",`${run.score} / ${run.total}`],["Tid",formatTime(run.time,true)],["Nøyaktighet",`${accuracy.toFixed(2)}%`],["Feilforsøk",run.wrong],
    ["Liv igjen",run.gameType==="training"?"—":run.livesRemaining],["Lengste streak",run.longestStreak],["Gjennomsnittstempo",`${pace.toFixed(2)} sek/siffer`],
    ["Sifre per minutt",(run.digitsPerMinute||0).toFixed(1)],["Raskeste 10",run.fastestTenMs?formatTime(run.fastestTenMs,true):"—"],["XP opptjent",run.xpEarned||"—"],["Nivå etter løpet",run.levelAfter||"—"],["Tierhjelp brukt",run.manualHelpCount||0]
  ].map(([l,v])=>`<div class="resultRow"><span>${l}</span><strong>${v}</strong></div>`).join("");
  e.resultBoardInfo.innerHTML=[
    ["Spiller",run.name],["Spilltype",run.gameType==="training"?"Trening":"Konkurranse"],["Modus",`${run.total} desimaler`],["Status",run.completed?"Fullført":"Ikke fullført"],
    ["Medalje",run.gameType==="training"?"Ingen":run.medal||"Ingen"],["Lagret",run.finishedAt?new Date(run.finishedAt).toLocaleString("no-NO"):"—"]
  ].map(([l,v])=>`<div class="resultRow"><span>${l}</span><strong>${escapeHtml(v)}</strong></div>`).join("");
  e.reviewGrid.innerHTML="";const f=document.createDocumentFragment();
  for(let i=0;i<run.total;i++){const c=document.createElement("div");c.className=`reviewCell ${i<run.score?"correct":"untried"}`;c.textContent=PI_DIGITS[i];f.appendChild(c)}e.reviewGrid.appendChild(f);
  e.paceHeader.textContent=`Måltid for ${run.total}`;
  e.paceRows.innerHTML=run.gameType==="training"?'<tr><td colspan="3">Treningsmodus gir ingen medaljer.</td></tr>':MEDALS.map(m=>`<tr><td class="${m.cls}"><strong>${m.emoji} ${m.name}</strong></td><td>≤ ${m.pace.toFixed(1)} sek/siffer</td><td>≤ ${formatTime(m.pace*run.total*1000,true)}</td></tr>`).join("");
  renderXpResult(history?null:xpAward);e.playAgain.style.display=history?"none":"";e.resultOverlay.classList.add("show");
}
function openFullProfile(){
  const s=stats(),runs=s.runs,levelState=getLevelState();
  e.fullProfileName.textContent=profile.username;e.profileMemberSince.textContent=`Profil siden ${new Date(localStorage.getItem("pi-profile-created-at")).toLocaleDateString("no-NO")}`;
  e.fullProfileStats.innerHTML=[[levelState.level,"Nivå"],[levelState.totalXp.toLocaleString("no-NO"),"Total XP"],[s.total,"Totalt løp"],[s.completed,"Fullførte"],[s.correct,"Totalt riktige"],[`${s.accuracy.toFixed(1)}%`,"Nøyaktighet"],[s.streak,"Lengste streak"],[s.fastest?formatTime(s.fastest,true):"—","Raskeste 10"],[s.training,"Treningssifre"],[Object.keys(unlocked()).length,"Achievements"]].map(([v,l])=>`<div class="miniStat"><b>${v}</b><span>${l}</span></div>`).join("");
  e.bestByMode.innerHTML=[20,50,100,200,400,750,1000].map(mode=>{const mr=runs.filter(r=>r.total===mode&&(r.gameType||"competition")==="competition"),done=mr.filter(r=>r.completed).sort((a,b)=>a.time-b.time)[0],best=mr.sort((a,b)=>b.score-a.score||a.time-b.time)[0];return `<div class="bestModeRow"><strong>${mode}</strong><span>${done?formatTime(done.time,true):"Ikke fullført"}</span><span>${best?`${best.score}/${mode}`:"—"}</span><span>${done?.medal||"—"}</span></div>`}).join("");
  e.recentRuns.innerHTML=runs.slice(0,12).map(r=>`<div class="recentRunRow" data-id="${r.id}"><strong>${r.gameType==="training"?"Trening":"Konkurranse"} ${r.total}</strong><span>${r.score}/${r.total}</span><span>${formatTime(r.time,true)}</span><span>${new Date(r.finishedAt).toLocaleDateString("no-NO")}</span></div>`).join("")||'<p class="empty">Ingen løp ennå.</p>';
  e.recentRuns.querySelectorAll(".recentRunRow").forEach(row=>row.onclick=()=>{const r=getLocalRuns().find(x=>x.id===row.dataset.id);if(r){e.fullProfileOverlay.classList.remove("show");renderResult(r,true)}});
  renderLevelUI();renderAchievements();e.fullProfileOverlay.classList.add("show");
}

const leaderboard=new Leaderboard({profile,elements:e,onRunSelect:r=>renderResult(r,true)});
const game=new PiGame(e,{
  canStart:()=>!!profile.username,
  requireProfile:()=>{openName(true);showToast(e.toast,"Velg og lagre et spillernavn før du starter.",true)},
  getPlayerName:()=>profile.username||"Spiller",
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
    fresh.forEach((a,i)=>setTimeout(()=>showAchievementToast(a),i*650));
    renderResult(run,false,xpAward);renderLevelUI();
    leaderboard.type=run.completed?"completed":"failed";await leaderboard.load();loadMiniStats();
    showToast(e.toast,"Resultatet er lagret i denne nettleseren.");
  }
});

e.status.textContent="Lokal lagring";e.status.className="status online";
e.input.oninput=()=>game.submit(e.input.value.slice(-1));e.start.onclick=()=>game.start();e.reset.onclick=()=>game.reset();
e.mode.onchange=async()=>{game.reset();await leaderboard.load()};e.gameType.onchange=async()=>{game.reset();await leaderboard.load()};
e.showBlockBtn.onclick=()=>game.showTrainingBlock(true);e.levelBtn.onclick=openFullProfile;e.profileBtn.onclick=()=>openName(false);e.editProfile.onclick=openFullProfile;
e.closeProfile.onclick=closeName;e.saveProfile.onclick=saveName;e.username.onkeydown=x=>{if(x.key==="Enter")saveName()};
document.querySelectorAll(".boardTab").forEach(b=>b.onclick=async()=>{leaderboard.type=b.dataset.board;await leaderboard.load()});
let timer;e.search.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>leaderboard.load(),300)};e.refresh.onclick=()=>leaderboard.load();
[e.closeResult,e.closeResult2].forEach(b=>b.onclick=()=>e.resultOverlay.classList.remove("show"));e.playAgain.onclick=()=>{e.resultOverlay.classList.remove("show");game.start()};
e.closeFullProfile.onclick=()=>e.fullProfileOverlay.classList.remove("show");e.closeAchievement.onclick=()=>e.achievementOverlay.classList.remove("show");
e.exportData.onclick=()=>{const blob=new Blob([JSON.stringify(exportAllData(),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`pi-digit-profile-${Date.now()}.json`;a.click();URL.revokeObjectURL(a.href)};
e.importData.onchange=async x=>{try{importAllData(JSON.parse(await x.target.files[0].text()));location.reload()}catch{showToast(e.toast,"Kunne ikke importere datafilen.",true)}};
e.deleteData.onclick=()=>{if(confirm("Dette sletter profil, løp, rekorder og achievements. Fortsette?")){clearAllGameData();location.reload()}};
window.addEventListener("keydown",x=>{if(x.key==="Escape"){e.resultOverlay.classList.remove("show");e.fullProfileOverlay.classList.remove("show");e.achievementOverlay.classList.remove("show");closeName()}});
updateProfileUI();renderLevelUI();leaderboard.load();loadMiniStats();if(!profile.username){e.username.value="Magnus";openName(true)}
