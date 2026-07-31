const XP_KEY = "pi-xp-v1";
const MAX_LEVEL = 100;

export function xpRequiredForNextLevel(level) {
  if (level >= MAX_LEVEL) return 0;
  return Math.round(140 + 30 * Math.pow(level, 1.48));
}

export function cumulativeXpForLevel(level) {
  let total = 0;
  for (let current = 1; current < Math.min(level, MAX_LEVEL); current += 1) {
    total += xpRequiredForNextLevel(current);
  }
  return total;
}

export function getTotalXp() {
  const value = Number(localStorage.getItem(XP_KEY));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function setTotalXp(value) {
  const xp = Math.max(0, Math.floor(Number(value) || 0));
  localStorage.setItem(XP_KEY, String(xp));
  return xp;
}

export function getLevelState(totalXp = getTotalXp()) {
  let level = 1;
  let xpAtLevelStart = 0;

  while (level < MAX_LEVEL) {
    const needed = xpRequiredForNextLevel(level);
    if (totalXp < xpAtLevelStart + needed) break;
    xpAtLevelStart += needed;
    level += 1;
  }

  const xpIntoLevel = level >= MAX_LEVEL
    ? 0
    : Math.max(0, totalXp - xpAtLevelStart);
  const xpForNext = xpRequiredForNextLevel(level);
  const progress = level >= MAX_LEVEL || xpForNext <= 0
    ? 1
    : Math.min(1, xpIntoLevel / xpForNext);

  return {
    level,
    totalXp,
    xpAtLevelStart,
    xpIntoLevel,
    xpForNext,
    progress,
    maxLevel: MAX_LEVEL
  };
}

export function calculateRunXp(run) {
  const score = Math.max(0, Number(run.score) || 0);
  const wrong = Math.max(0, Number(run.wrong) || 0);
  const attempts = score + wrong;
  const accuracy = attempts > 0 ? score / attempts : 0;

  // Depth is the main XP driver. The exponent rewards getting deeper into π.
  const depthXp = score * 1.2 + 0.7 * Math.pow(score, 1.28);

  // Training gives useful progression, but competition remains the fastest path.
  const typeMultiplier = run.gameType === "training" ? 0.55 : 1;

  // Accuracy matters without making imperfect runs worthless.
  const accuracyMultiplier = 0.70 + 0.30 * accuracy;

  let completionBonus = 0;
  if (run.completed) {
    completionBonus = run.gameType === "training"
      ? run.total * 0.25
      : run.total * 1.80;
  }

  let medalMultiplier = 1;
  if (run.gameType === "competition" && run.completed) {
    if (run.medal === "Gull") medalMultiplier = 1.20;
    else if (run.medal === "Sølv") medalMultiplier = 1.10;
    else if (run.medal === "Bronse") medalMultiplier = 1.05;
  }

  const raw = (depthXp * typeMultiplier * accuracyMultiplier + completionBonus)
    * medalMultiplier;

  // Every finished run gives at least a little XP.
  return Math.max(10, Math.round(raw));
}

export function awardRunXp(run) {
  const before = getLevelState();
  const gained = calculateRunXp(run);
  const totalXp = setTotalXp(before.totalXp + gained);
  const after = getLevelState(totalXp);

  return {
    gained,
    before,
    after,
    levelsGained: Math.max(0, after.level - before.level)
  };
}

export function exportXpData() {
  return { totalXp: getTotalXp() };
}

export function importXpData(data) {
  setTotalXp(data?.totalXp || 0);
}
