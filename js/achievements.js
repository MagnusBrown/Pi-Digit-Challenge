import { getLocalRuns } from "./storage.js";
const B="./assets/badges/";
export const ACHIEVEMENTS=[

{id:"rising-recruit",name:"Rising Recruit",cat:"Level",rarity:"bronze",img:B+"rising-recruit.webp",desc:"Reach Level 5.",test:c=>c.level>=5},
{id:"seasoned-mind",name:"Seasoned Mind",cat:"Level",rarity:"silver",img:B+"seasoned-mind.webp",desc:"Reach Level 10.",test:c=>c.level>=10},
{id:"elite-recaller",name:"Elite Recaller",cat:"Level",rarity:"gold",img:B+"elite-recaller.webp",desc:"Reach Level 25.",test:c=>c.level>=25},
{id:"master-of-digits",name:"Master of Digits",cat:"Level",rarity:"diamond",img:B+"master-of-digits.webp",desc:"Reach Level 50.",test:c=>c.level>=50},
{id:"legend-of-pi",name:"Legend of Pi",cat:"Level",rarity:"legendary",img:B+"legend-of-pi.webp",desc:"Reach the maximum level: Level 100.",test:c=>c.level>=100},

{id:"first-steps",name:"First Steps",cat:"Progress",rarity:"bronze",img:B+"first-steps.webp",desc:"Recall at least 10 correct digits in a single run.",test:c=>c.run?.score>=10},
{id:"half-century",name:"Half Century",cat:"Progress",rarity:"silver",img:B+"half-century.webp",desc:"Recall at least 50 correct digits in a single run.",test:c=>c.run?.score>=50},
{id:"centurion",name:"Centurion",cat:"Progress",rarity:"gold",img:B+"centurion.webp",desc:"Recall at least 100 correct digits in a single run.",test:c=>c.run?.score>=100},
{id:"deep-memory",name:"Deep Memory",cat:"Progress",rarity:"gold",img:B+"deep-memory.webp",desc:"Recall at least 400 correct digits in a single run.",test:c=>c.run?.score>=400},
{id:"pi-scholar",name:"Pi Scholar",cat:"Progress",rarity:"diamond",img:B+"pi-scholar.webp",desc:"Recall at least 750 correct digits in a single run.",test:c=>c.run?.score>=750},
{id:"memory-master",name:"Memory Master",cat:"Progress",rarity:"legendary",img:B+"memory-master.webp",desc:"Complete the 1,000-digit challenge.",test:c=>c.run?.completed&&c.run.total===1000},
{id:"speedster",name:"Speedster",cat:"Speed",rarity:"silver",img:B+"speedster.webp",desc:"Enter 10 consecutive correct digits in under 3 seconds.",test:c=>c.run?.fastestTenMs>0&&c.run.fastestTenMs<3000},
{id:"lightning-ten",name:"Lightning Ten",cat:"Speed",rarity:"gold",img:B+"lightning-ten.webp",desc:"Enter 10 consecutive correct digits in under 2 seconds.",test:c=>c.run?.fastestTenMs>0&&c.run.fastestTenMs<2000},
{id:"rapid-recall",name:"Rapid Recall",cat:"Speed",rarity:"silver",img:B+"rapid-recall.webp",desc:"Maintain at least 60 digits per minute across 50 digits.",test:c=>c.run?.score>=50&&c.run.digitsPerMinute>=60},
{id:"pi-sprinter",name:"Pi Sprinter",cat:"Speed",rarity:"gold",img:B+"pi-sprinter.webp",desc:"Complete 100 digits at Gold-medal pace.",test:c=>c.run?.completed&&c.run.total===100&&["Gold","Gull"].includes(c.run.medal)},
{id:"flawless-velocity",name:"Flawless Velocity",cat:"Speed",rarity:"diamond",img:B+"flawless-velocity.webp",desc:"Complete a run at Gold-medal pace without a single mistake.",test:c=>c.run?.completed&&["Gold","Gull"].includes(c.run.medal)&&c.run.wrong===0},
{id:"perfect-ten",name:"Perfect Ten",cat:"Precision",rarity:"bronze",img:B+"perfect-ten.webp",desc:"Enter at least 10 correct digits without a mistake.",test:c=>c.run?.score>=10&&c.run.wrong===0},
{id:"flawless-fifty",name:"Flawless Fifty",cat:"Precision",rarity:"silver",img:B+"flawless-fifty.webp",desc:"Complete 50 digits without a mistake.",test:c=>c.run?.completed&&c.run.total===50&&c.run.wrong===0},
{id:"perfect-century",name:"Perfect Century",cat:"Precision",rarity:"gold",img:B+"perfect-century.webp",desc:"Complete 100 digits without a mistake.",test:c=>c.run?.completed&&c.run.total===100&&c.run.wrong===0},
{id:"untouchable",name:"Untouchable",cat:"Precision",rarity:"gold",img:B+"untouchable.webp",desc:"Complete a competition run with all five lives remaining.",test:c=>c.run?.completed&&c.run.gameType==="competition"&&c.run.livesRemaining===5},
{id:"precision-expert",name:"Precision Expert",cat:"Precision",rarity:"diamond",img:B+"precision-expert.webp",desc:"Maintain at least 98% accuracy across 200 attempts.",test:c=>c.totalAttempts>=200&&c.averageAccuracy>=98},
{id:"in-the-zone",name:"In the Zone",cat:"Streaks",rarity:"bronze",img:B+"in-the-zone.webp",desc:"Build a streak of 25 correct digits.",test:c=>c.maxStreak>=25},
{id:"locked-in",name:"Locked In",cat:"Streaks",rarity:"silver",img:B+"locked-in.webp",desc:"Build a streak of 100 correct digits.",test:c=>c.maxStreak>=100},
{id:"unbroken",name:"Unbroken",cat:"Streaks",rarity:"gold",img:B+"unbroken.webp",desc:"Build a streak of 250 correct digits.",test:c=>c.maxStreak>=250},
{id:"perfect-recall",name:"Perfect Recall",cat:"Streaks",rarity:"legendary",img:B+"perfect-recall.webp",desc:"Build an unbroken streak of 1,000 correct digits.",test:c=>c.maxStreak>=1000},
{id:"machine-memory",name:"Machine Memory",cat:"Streaks",rarity:"diamond",img:B+"machine-memory.webp",desc:"Build a streak of 500 correct digits.",test:c=>c.maxStreak>=500},
{id:"student-of-pi",name:"Student of Pi",cat:"Training",rarity:"bronze",img:B+"student-of-pi.webp",desc:"Recall a total of 100 correct digits in Training mode.",test:c=>c.trainingCorrect>=100},
{id:"learning-blocks",name:"Learning the Blocks",cat:"Training",rarity:"silver",img:B+"learning-blocks.webp",desc:"Use the 10-digit block hint across 10 different blocks.",test:c=>c.uniqueBlocks>=10},
{id:"no-more-help",name:"No More Help",cat:"Training",rarity:"gold",img:B+"no-more-help.webp",desc:"Complete a Training run without hints after previously using block assistance.",test:c=>c.noMoreHelp},
{id:"training-marathon",name:"Training Marathon",cat:"Training",rarity:"diamond",img:B+"training-marathon.webp",desc:"Recall a total of 1,000 correct digits in Training mode.",test:c=>c.trainingCorrect>=1000},
{id:"practice-pays-off",name:"Practice Pays Off",cat:"Training",rarity:"gold",img:B+"practice-pays-off.webp",desc:"Set a new personal best after completing at least three Training sessions.",test:c=>c.trainingRuns>=3&&c.newPersonalBest},
{id:"persistent",name:"Persistent",cat:"Dedication",rarity:"bronze",img:B+"persistent.webp",desc:"Complete 10 runs.",test:c=>c.totalRuns>=10},
{id:"dedicated",name:"Dedicated",cat:"Dedication",rarity:"silver",img:B+"dedicated.webp",desc:"Complete 50 runs.",test:c=>c.totalRuns>=50},
{id:"pi-veteran",name:"Pi Veteran",cat:"Dedication",rarity:"gold",img:B+"pi-veteran.webp",desc:"Complete 250 runs.",test:c=>c.totalRuns>=250},
{id:"collector",name:"Collector",cat:"Dedication",rarity:"gold",img:B+"collector.webp",desc:"Unlock 10 achievements.",test:c=>c.unlockedCount>=10},
{id:"last-heart",name:"Last Heart",cat:"Secret",rarity:"gold",img:B+"last-heart.webp",desc:"Complete a competition run with exactly one life remaining.",secret:true,test:c=>c.run?.completed&&c.run.livesRemaining===1},
{id:"night-owl",name:"Night Owl",cat:"Secret",rarity:"silver",img:B+"night-owl.webp",desc:"Set a new personal best between midnight and 5:00 a.m.",secret:true,test:c=>c.newPersonalBest&&new Date().getHours()<5},
{id:"comeback",name:"Comeback",cat:"Secret",rarity:"gold",img:B+"comeback.webp",desc:"Set a new personal best immediately after an incomplete run.",secret:true,test:c=>c.newPersonalBest&&c.previousRun?.completed===false}
];
const KEY="pi-achievements-v1";
export function unlocked(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return{}}}
export function context(run=null,extra={}){
 const runs=getLocalRuns(),train=runs.filter(r=>r.gameType==="training"),blocks=new Set(train.flatMap(r=>r.trainingBlocks||[]));
 const priorHelp=runs.slice(1).some(r=>r.gameType==="training"&&(r.trainingBlocks||[]).length);const noMoreHelp=!!(run?.gameType==="training"&&run.completed&&!(run.trainingBlocks||[]).length&&priorHelp);return {run,noMoreHelp,totalRuns:runs.length,totalAttempts:runs.reduce((s,r)=>s+r.score+(r.wrong||0),0),averageAccuracy:(()=>{const a=runs.reduce((s,r)=>s+r.score+(r.wrong||0),0),c=runs.reduce((s,r)=>s+r.score,0);return a?c/a*100:100})(),trainingRuns:train.length,previousRun:runs[1]||null,maxStreak:runs.reduce((m,r)=>Math.max(m,r.longestStreak||0),0),trainingCorrect:train.reduce((s,r)=>s+r.score,0),uniqueBlocks:blocks.size,unlockedCount:Object.keys(unlocked()).length,...extra};
}
export function evaluate(c){
 const u=unlocked(),fresh=[];
 for(const a of ACHIEVEMENTS){if(u[a.id])continue;try{if(a.test({...c,unlockedCount:Object.keys(u).length+fresh.length})){u[a.id]={unlockedAt:new Date().toISOString(),runId:c.run?.id||null};fresh.push(a)}}catch{}}
 localStorage.setItem(KEY,JSON.stringify(u));return fresh;
}
