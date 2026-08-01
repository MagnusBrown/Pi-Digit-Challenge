const RUNS_KEY = "pi-runs-v3";

export function getLocalRuns() {
  try {
    return JSON.parse(localStorage.getItem(RUNS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLocalRun(run) {
  const runs = getLocalRuns();
  runs.unshift(run);
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, 250)));
}

export function getBestTime(mode) {
  const value = Number(localStorage.getItem(`pi-best-${mode}`));
  return value || null;
}

export function saveBestTime(mode, time) {
  const current = getBestTime(mode);
  if (!current || time < current) {
    localStorage.setItem(`pi-best-${mode}`, String(time));
  }
}

export function exportAllData(){return{version:4,exportedAt:new Date().toISOString(),playerName:localStorage.getItem("pi-player-name")||"",profileCreatedAt:localStorage.getItem("pi-profile-created-at")||"",runs:getLocalRuns(),achievements:JSON.parse(localStorage.getItem("pi-achievements-v1")||"{}"),totalXp:Number(localStorage.getItem("pi-xp-v1")||0)}}
export function importAllData(data){if(!data||!Array.isArray(data.runs))throw new Error("Invalid data file");localStorage.setItem(RUNS_KEY,JSON.stringify(data.runs.slice(0,500)));if(data.playerName)localStorage.setItem("pi-player-name",data.playerName);if(data.profileCreatedAt)localStorage.setItem("pi-profile-created-at",data.profileCreatedAt);localStorage.setItem("pi-achievements-v1",JSON.stringify(data.achievements||{}));localStorage.setItem("pi-xp-v1",String(Math.max(0,Number(data.totalXp)||0)))}
export function clearAllGameData(){Object.keys(localStorage).filter(k=>k.startsWith("pi-")).forEach(k=>localStorage.removeItem(k))}
