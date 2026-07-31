import { getLocalRuns } from "./storage.js";
const B="./assets/badges/";
export const ACHIEVEMENTS=[

{id:"rising-recruit",name:"Rising Recruit",cat:"Nivå",rarity:"bronze",img:B+"rising-recruit.webp",desc:"Nå nivå 5.",test:c=>c.level>=5},
{id:"seasoned-mind",name:"Seasoned Mind",cat:"Nivå",rarity:"silver",img:B+"seasoned-mind.webp",desc:"Nå nivå 10.",test:c=>c.level>=10},
{id:"elite-recaller",name:"Elite Recaller",cat:"Nivå",rarity:"gold",img:B+"elite-recaller.webp",desc:"Nå nivå 25.",test:c=>c.level>=25},
{id:"master-of-digits",name:"Master of Digits",cat:"Nivå",rarity:"diamond",img:B+"master-of-digits.webp",desc:"Nå nivå 50.",test:c=>c.level>=50},
{id:"legend-of-pi",name:"Legend of Pi",cat:"Nivå",rarity:"legendary",img:B+"legend-of-pi.webp",desc:"Nå maksnivå 100.",test:c=>c.level>=100},

{id:"first-steps",name:"First Steps",cat:"Fremgang",rarity:"bronze",img:B+"first-steps.webp",desc:"Skriv minst 10 riktige sifre i ett løp.",test:c=>c.run?.score>=10},
{id:"half-century",name:"Half Century",cat:"Fremgang",rarity:"silver",img:B+"half-century.webp",desc:"Skriv minst 50 riktige sifre i ett løp.",test:c=>c.run?.score>=50},
{id:"centurion",name:"Centurion",cat:"Fremgang",rarity:"gold",img:B+"centurion.webp",desc:"Skriv minst 100 riktige sifre i ett løp.",test:c=>c.run?.score>=100},
{id:"deep-memory",name:"Deep Memory",cat:"Fremgang",rarity:"gold",img:B+"deep-memory.webp",desc:"Skriv minst 400 riktige sifre i ett løp.",test:c=>c.run?.score>=400},
{id:"pi-scholar",name:"Pi Scholar",cat:"Fremgang",rarity:"diamond",img:B+"pi-scholar.webp",desc:"Skriv minst 750 riktige sifre i ett løp.",test:c=>c.run?.score>=750},
{id:"memory-master",name:"Memory Master",cat:"Fremgang",rarity:"legendary",img:B+"memory-master.webp",desc:"Fullfør 1 000 desimaler.",test:c=>c.run?.completed&&c.run.total===1000},
{id:"speedster",name:"Speedster",cat:"Fart",rarity:"silver",img:B+"speedster.webp",desc:"Skriv 10 riktige sifre på rad på under 3 sekunder.",test:c=>c.run?.fastestTenMs>0&&c.run.fastestTenMs<3000},
{id:"lightning-ten",name:"Lightning Ten",cat:"Fart",rarity:"gold",img:B+"lightning-ten.webp",desc:"Skriv 10 riktige sifre på rad på under 2 sekunder.",test:c=>c.run?.fastestTenMs>0&&c.run.fastestTenMs<2000},
{id:"rapid-recall",name:"Rapid Recall",cat:"Fart",rarity:"silver",img:B+"rapid-recall.webp",desc:"Hold minst 60 sifre per minutt gjennom 50 sifre.",test:c=>c.run?.score>=50&&c.run.digitsPerMinute>=60},
{id:"pi-sprinter",name:"Pi Sprinter",cat:"Fart",rarity:"gold",img:B+"pi-sprinter.webp",desc:"Fullfør 100 desimaler med gulltempo.",test:c=>c.run?.completed&&c.run.total===100&&c.run.medal==="Gull"},
{id:"flawless-velocity",name:"Flawless Velocity",cat:"Fart",rarity:"diamond",img:B+"flawless-velocity.webp",desc:"Fullfør med gulltempo uten feil.",test:c=>c.run?.completed&&c.run.medal==="Gull"&&c.run.wrong===0},
{id:"perfect-ten",name:"Perfect Ten",cat:"Presisjon",rarity:"bronze",img:B+"perfect-ten.webp",desc:"Skriv minst 10 riktige uten feil.",test:c=>c.run?.score>=10&&c.run.wrong===0},
{id:"flawless-fifty",name:"Flawless Fifty",cat:"Presisjon",rarity:"silver",img:B+"flawless-fifty.webp",desc:"Fullfør 50 desimaler uten feil.",test:c=>c.run?.completed&&c.run.total===50&&c.run.wrong===0},
{id:"perfect-century",name:"Perfect Century",cat:"Presisjon",rarity:"gold",img:B+"perfect-century.webp",desc:"Fullfør 100 desimaler uten feil.",test:c=>c.run?.completed&&c.run.total===100&&c.run.wrong===0},
{id:"untouchable",name:"Untouchable",cat:"Presisjon",rarity:"gold",img:B+"untouchable.webp",desc:"Fullfør med alle fem liv igjen.",test:c=>c.run?.completed&&c.run.gameType==="competition"&&c.run.livesRemaining===5},
{id:"precision-expert",name:"Precision Expert",cat:"Presisjon",rarity:"diamond",img:B+"precision-expert.webp",desc:"Oppnå minst 98 % nøyaktighet over 200 forsøk.",test:c=>c.totalAttempts>=200&&c.averageAccuracy>=98},
{id:"in-the-zone",name:"In the Zone",cat:"Streaks",rarity:"bronze",img:B+"in-the-zone.webp",desc:"Oppnå en streak på 25.",test:c=>c.maxStreak>=25},
{id:"locked-in",name:"Locked In",cat:"Streaks",rarity:"silver",img:B+"locked-in.webp",desc:"Oppnå en streak på 100.",test:c=>c.maxStreak>=100},
{id:"unbroken",name:"Unbroken",cat:"Streaks",rarity:"gold",img:B+"unbroken.webp",desc:"Oppnå en streak på 250.",test:c=>c.maxStreak>=250},
{id:"perfect-recall",name:"Perfect Recall",cat:"Streaks",rarity:"legendary",img:B+"perfect-recall.webp",desc:"Oppnå en streak på 1 000.",test:c=>c.maxStreak>=1000},
{id:"machine-memory",name:"Machine Memory",cat:"Streaks",rarity:"diamond",img:B+"machine-memory.webp",desc:"Oppnå en streak på 500.",test:c=>c.maxStreak>=500},
{id:"student-of-pi",name:"Student of Pi",cat:"Trening",rarity:"bronze",img:B+"student-of-pi.webp",desc:"Skriv totalt 100 riktige sifre i treningsmodus.",test:c=>c.trainingCorrect>=100},
{id:"learning-blocks",name:"Learning the Blocks",cat:"Trening",rarity:"silver",img:B+"learning-blocks.webp",desc:"Bruk tiergruppehjelp i ti ulike tiergrupper.",test:c=>c.uniqueBlocks>=10},
{id:"no-more-help",name:"No More Help",cat:"Trening",rarity:"gold",img:B+"no-more-help.webp",desc:"Fullfør en treningsmodus uten hjelp etter tidligere å ha brukt tiergruppehjelp.",test:c=>c.noMoreHelp},
{id:"training-marathon",name:"Training Marathon",cat:"Trening",rarity:"diamond",img:B+"training-marathon.webp",desc:"Skriv totalt 1 000 riktige sifre i trening.",test:c=>c.trainingCorrect>=1000},
{id:"practice-pays-off",name:"Practice Pays Off",cat:"Trening",rarity:"gold",img:B+"practice-pays-off.webp",desc:"Sett personlig rekord etter minst tre treningsøkter.",test:c=>c.trainingRuns>=3&&c.newPersonalBest},
{id:"persistent",name:"Persistent",cat:"Utholdenhet",rarity:"bronze",img:B+"persistent.webp",desc:"Gjennomfør 10 løp.",test:c=>c.totalRuns>=10},
{id:"dedicated",name:"Dedicated",cat:"Utholdenhet",rarity:"silver",img:B+"dedicated.webp",desc:"Gjennomfør 50 løp.",test:c=>c.totalRuns>=50},
{id:"pi-veteran",name:"Pi Veteran",cat:"Utholdenhet",rarity:"gold",img:B+"pi-veteran.webp",desc:"Gjennomfør 250 løp.",test:c=>c.totalRuns>=250},
{id:"collector",name:"Collector",cat:"Utholdenhet",rarity:"gold",img:B+"collector.webp",desc:"Lås opp 10 achievements.",test:c=>c.unlockedCount>=10},
{id:"last-heart",name:"Last Heart",cat:"Hemmelig",rarity:"gold",img:B+"last-heart.webp",desc:"Fullfør med bare ett liv igjen.",secret:true,test:c=>c.run?.completed&&c.run.livesRemaining===1},
{id:"night-owl",name:"Night Owl",cat:"Hemmelig",rarity:"silver",img:B+"night-owl.webp",desc:"Sett ny rekord mellom midnatt og 05.",secret:true,test:c=>c.newPersonalBest&&new Date().getHours()<5},
{id:"comeback",name:"Comeback",cat:"Hemmelig",rarity:"gold",img:B+"comeback.webp",desc:"Sett ny rekord rett etter et mislykket løp.",secret:true,test:c=>c.newPersonalBest&&c.previousRun?.completed===false}
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
