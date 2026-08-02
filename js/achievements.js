import { getLocalRuns } from "./storage.js";
const B="./assets/badges/";

export const ACHIEVEMENTS=[
{id:"rising-recruit",name:"Rising Recruit",cat:"Level",rarity:"bronze",img:B+"rising-recruit.webp",desc:"Reach Level 5.",test:c=>c.level>=5},
{id:"seasoned-mind",name:"Seasoned Mind",cat:"Level",rarity:"silver",img:B+"seasoned-mind.webp",desc:"Reach Level 15.",test:c=>c.level>=15},
{id:"elite-recaller",name:"Elite Recaller",cat:"Level",rarity:"gold",img:B+"elite-recaller.webp",desc:"Reach Level 30.",test:c=>c.level>=30},
{id:"master-of-digits",name:"Master of Digits",cat:"Level",rarity:"diamond",img:B+"master-of-digits.webp",desc:"Reach Level 60.",test:c=>c.level>=60},
{id:"legend-of-pi",name:"Legend of Pi",cat:"Level",rarity:"legendary",img:B+"legend-of-pi.webp",desc:"Reach Level 100.",test:c=>c.level>=100},

{id:"first-steps",name:"First Steps",cat:"Progress",rarity:"bronze",img:B+"first-steps.webp",desc:"Recall at least 25 correct digits in a single run.",test:c=>c.run?.score>=25},
{id:"half-century",name:"Half Century",cat:"Progress",rarity:"silver",img:B+"half-century.webp",desc:"Recall at least 50 correct digits in a single run.",test:c=>c.run?.score>=50},
{id:"centurion",name:"Centurion",cat:"Progress",rarity:"gold",img:B+"centurion.webp",desc:"Recall at least 100 correct digits in a single run.",test:c=>c.run?.score>=100},
{id:"deep-memory",name:"Deep Memory",cat:"Progress",rarity:"gold",img:B+"deep-memory.webp",desc:"Recall at least 400 correct digits in a single run.",test:c=>c.run?.score>=400},
{id:"pi-scholar",name:"Pi Scholar",cat:"Progress",rarity:"diamond",img:B+"pi-scholar.webp",desc:"Recall at least 750 correct digits in a single run.",test:c=>c.run?.score>=750},
{id:"memory-master",name:"Memory Master",cat:"Progress",rarity:"legendary",img:B+"memory-master.webp",desc:"Complete the 1,000-digit challenge.",test:c=>c.run?.completed&&c.run.total===1000},

{id:"speedster",name:"Speedster",cat:"Speed",rarity:"silver",img:B+"speedster.webp",desc:"Enter 10 consecutive correct digits in under 3 seconds.",test:c=>c.run?.fastestTenMs>0&&c.run.fastestTenMs<3000},
{id:"lightning-ten",name:"Lightning Ten",cat:"Speed",rarity:"gold",img:B+"lightning-ten.webp",desc:"Enter 10 consecutive correct digits in under 2 seconds.",test:c=>c.run?.fastestTenMs>0&&c.run.fastestTenMs<2000},
{id:"rapid-recall",name:"Rapid Recall",cat:"Speed",rarity:"silver",img:B+"rapid-recall.webp",desc:"Maintain at least 60 digits per minute across 50 digits.",test:c=>c.run?.score>=50&&c.run.digitsPerMinute>=60},
{id:"pi-sprinter",name:"Pi Sprinter",cat:"Speed",rarity:"gold",img:B+"pi-sprinter.webp",desc:"Complete 100 digits at Gold pace or faster.",test:c=>c.run?.completed&&c.run.total===100&&["Platinum","Diamond","Gold","Gull"].includes(c.run.medal)},
{id:"diamond-run",name:"Diamond Tempo",cat:"Speed",rarity:"diamond",img:B+"flawless-velocity.webp",desc:"Complete any competition run at Diamond pace or faster.",test:c=>c.run?.completed&&["Platinum","Diamond"].includes(c.run.medal)},
{id:"platinum-run",name:"Platinum Tempo",cat:"Speed",rarity:"legendary",img:B+"caesar-of-pi.webp",desc:"Complete any competition run at Platinum pace.",test:c=>c.run?.completed&&c.run.medal==="Platinum"},

{id:"perfect-ten",name:"Perfect Start",cat:"Precision",rarity:"bronze",img:B+"perfect-ten.webp",desc:"Enter at least 25 correct digits without a mistake.",test:c=>c.run?.score>=25&&c.run.wrong===0},
{id:"flawless-fifty",name:"Flawless Fifty",cat:"Precision",rarity:"silver",img:B+"flawless-fifty.webp",desc:"Complete 50 digits without a mistake.",test:c=>c.run?.completed&&c.run.total===50&&c.run.wrong===0},
{id:"perfect-century",name:"Perfect Century",cat:"Precision",rarity:"gold",img:B+"perfect-century.webp",desc:"Complete 100 digits without a mistake.",test:c=>c.run?.completed&&c.run.total===100&&c.run.wrong===0},
{id:"untouchable",name:"Untouchable",cat:"Precision",rarity:"gold",img:B+"untouchable.webp",desc:"Complete a competition run with all five lives remaining.",test:c=>c.run?.completed&&c.run.gameType==="competition"&&c.run.livesRemaining===5},
{id:"precision-expert",name:"Precision Expert",cat:"Precision",rarity:"diamond",img:B+"precision-expert.webp",desc:"Maintain at least 98% accuracy across 500 attempts.",test:c=>c.totalAttempts>=500&&c.averageAccuracy>=98},

{id:"in-the-zone",name:"In the Zone",cat:"Streaks",rarity:"bronze",img:B+"in-the-zone.webp",desc:"Build a streak of 50 correct digits in one run.",test:c=>c.maxStreak>=50},
{id:"locked-in",name:"Locked In",cat:"Streaks",rarity:"silver",img:B+"locked-in.webp",desc:"Build a streak of 100 correct digits in one run.",test:c=>c.maxStreak>=100},
{id:"unbroken",name:"Unbroken",cat:"Streaks",rarity:"gold",img:B+"unbroken.webp",desc:"Build a streak of 250 correct digits in one run.",test:c=>c.maxStreak>=250},
{id:"machine-memory",name:"Machine Memory",cat:"Streaks",rarity:"diamond",img:B+"machine-memory.webp",desc:"Build a streak of 500 correct digits in one run.",test:c=>c.maxStreak>=500},
{id:"perfect-recall",name:"Perfect Recall",cat:"Streaks",rarity:"legendary",img:B+"perfect-recall.webp",desc:"Build an unbroken streak of 1,000 correct digits in one run.",test:c=>c.maxStreak>=1000},
{id:"iron-line-500",name:"Iron Line 500",cat:"Premium",rarity:"diamond",img:B+"iron-mind.webp",desc:"Accumulate 500 consecutive correct digits across flawless competition runs.",test:c=>c.flawlessChain>=500},
{id:"golden-line-1000",name:"Golden Line 1000",cat:"Premium",rarity:"legendary",img:B+"imperator.webp",desc:"Accumulate 1,000 consecutive correct digits across flawless competition runs.",test:c=>c.flawlessChain>=1000},
{id:"no-miss-200",name:"No-Miss 200",cat:"Premium",rarity:"diamond",img:B+"legionnaire.webp",desc:"Complete 200 digits without a mistake.",test:c=>c.run?.completed&&c.run.total===200&&c.run.wrong===0},
{id:"grandmaster-400",name:"Grandmaster 400",cat:"Premium",rarity:"legendary",img:B+"collector.webp",desc:"Complete 400 digits at Diamond pace or faster.",test:c=>c.run?.completed&&c.run.total===400&&["Platinum","Diamond"].includes(c.run.medal)},

{id:"student-of-pi",name:"Student of Pi",cat:"Training",rarity:"bronze",img:B+"student-of-pi.webp",desc:"Recall a total of 250 correct digits in Training mode.",test:c=>c.trainingCorrect>=250},
{id:"learning-blocks",name:"Learning the Blocks",cat:"Training",rarity:"silver",img:B+"learning-blocks.webp",desc:"Use the 10-digit block hint across 10 different blocks.",test:c=>c.uniqueBlocks>=10},
{id:"no-more-help",name:"No More Help",cat:"Training",rarity:"gold",img:B+"no-more-help.webp",desc:"Complete a Training run without hints after previously using block assistance.",test:c=>c.noMoreHelp},
{id:"training-marathon",name:"Training Marathon",cat:"Training",rarity:"diamond",img:B+"training-marathon.webp",desc:"Recall a total of 2,000 correct digits in Training mode.",test:c=>c.trainingCorrect>=2000},
{id:"custom-scholar",name:"Custom Scholar",cat:"Training",rarity:"gold",img:B+"pi-scholar.webp",desc:"Complete a custom Training range of at least 50 digits.",test:c=>c.run?.gameType==="training"&&c.run.custom&&c.run.completed&&c.run.total>=50},
{id:"range-master",name:"Range Master",cat:"Training",rarity:"diamond",img:B+"master-of-digits.webp",desc:"Complete a custom Training range of at least 150 digits.",test:c=>c.run?.gameType==="training"&&c.run.custom&&c.run.completed&&c.run.total>=150},
{id:"practice-pays-off",name:"Practice Pays Off",cat:"Training",rarity:"gold",img:B+"practice-pays-off.webp",desc:"Set a new personal best after completing at least three Training sessions.",test:c=>c.trainingRuns>=3&&c.newPersonalBest},

{id:"persistent",name:"Persistent",cat:"Dedication",rarity:"bronze",img:B+"persistent.webp",desc:"Complete 25 runs.",test:c=>c.totalRuns>=25},
{id:"dedicated",name:"Dedicated",cat:"Dedication",rarity:"silver",img:B+"dedicated.webp",desc:"Complete 100 runs.",test:c=>c.totalRuns>=100},
{id:"pi-veteran",name:"Pi Veteran",cat:"Dedication",rarity:"gold",img:B+"pi-veteran.webp",desc:"Complete 250 runs.",test:c=>c.totalRuns>=250},
{id:"collector",name:"Collector",cat:"Dedication",rarity:"gold",img:B+"collector.webp",desc:"Unlock 20 achievements.",test:c=>c.unlockedCount>=20},

{id:"last-heart",name:"Last Heart",cat:"Secret",rarity:"gold",img:B+"last-heart.webp",desc:"Complete a competition run with exactly one life remaining.",secret:true,test:c=>c.run?.completed&&c.run.livesRemaining===1},
{id:"night-owl",name:"Night Owl",cat:"Secret",rarity:"silver",img:B+"night-owl.webp",desc:"Set a new personal best between midnight and 5:00 a.m.",secret:true,test:c=>c.newPersonalBest&&new Date().getHours()<5},
{id:"comeback",name:"Comeback",cat:"Secret",rarity:"gold",img:B+"comeback.webp",desc:"Set a new personal best immediately after an incomplete run.",secret:true,test:c=>c.newPersonalBest&&c.previousRun?.completed===false}
];

const KEY="pi-achievements-v1";
export function unlocked(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return{}}}

function flawlessChain(runs){
  let total=0;
  for(const run of runs){
    if((run.gameType||"competition")!=="competition")continue;
    if(run.completed&&run.wrong===0)total+=run.score||0;
    else break;
  }
  return total;
}

export function context(run=null,extra={}){
 const runs=getLocalRuns(),train=runs.filter(r=>r.gameType==="training"),blocks=new Set(train.flatMap(r=>r.trainingBlocks||[]));
 const priorHelp=runs.slice(1).some(r=>r.gameType==="training"&&(r.trainingBlocks||[]).length);
 const noMoreHelp=!!(run?.gameType==="training"&&run.completed&&!(run.trainingBlocks||[]).length&&priorHelp);
 const attempts=runs.reduce((s,r)=>s+r.score+(r.wrong||0),0);
 const correct=runs.reduce((s,r)=>s+r.score,0);
 return {
   run,
   noMoreHelp,
   totalRuns:runs.length,
   totalAttempts:attempts,
   averageAccuracy:attempts?correct/attempts*100:100,
   trainingRuns:train.length,
   previousRun:runs[1]||null,
   maxStreak:runs.reduce((m,r)=>Math.max(m,r.longestStreak||0),0),
   flawlessChain:flawlessChain(runs),
   trainingCorrect:train.reduce((s,r)=>s+r.score,0),
   uniqueBlocks:blocks.size,
   unlockedCount:Object.keys(unlocked()).length,
   ...extra
 };
}
export function evaluate(c){
 const u=unlocked(),fresh=[];
 for(const a of ACHIEVEMENTS){if(u[a.id])continue;try{if(a.test({...c,unlockedCount:Object.keys(u).length+fresh.length})){u[a.id]={unlockedAt:new Date().toISOString(),runId:c.run?.id||null};fresh.push(a)}}catch{}}
 localStorage.setItem(KEY,JSON.stringify(u));return fresh;
}
