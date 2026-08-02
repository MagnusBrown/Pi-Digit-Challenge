export const MODES = [20, 50, 100, 200, 400, 750, 1000];
export const MAX_DIGITS = 1000;
export const PI_DIGITS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";
export const MEDALS = [
  { name: "Platinum", icon: "./assets/medals/platinum.webp", cls: "platinum" },
  { name: "Diamond", icon: "./assets/medals/diamond.webp", cls: "diamond" },
  { name: "Gold", icon: "./assets/medals/gold.webp", cls: "gold" },
  { name: "Silver", icon: "./assets/medals/silver.webp", cls: "silver" },
  { name: "Bronze", icon: "./assets/medals/bronze.webp", cls: "bronze" }
];

export const MEDAL_SPEEDS_BY_MODE = Object.freeze({
  20:   Object.freeze({ Platinum: 3.00, Diamond: 2.60, Gold: 2.20, Silver: 1.60, Bronze: 1.00 }),
  50:   Object.freeze({ Platinum: 2.60, Diamond: 2.25, Gold: 1.90, Silver: 1.40, Bronze: 0.90 }),
  100:  Object.freeze({ Platinum: 2.20, Diamond: 1.90, Gold: 1.60, Silver: 1.20, Bronze: 0.80 }),
  200:  Object.freeze({ Platinum: 1.95, Diamond: 1.70, Gold: 1.45, Silver: 1.08, Bronze: 0.72 }),
  400:  Object.freeze({ Platinum: 1.70, Diamond: 1.50, Gold: 1.28, Silver: 0.96, Bronze: 0.64 }),
  750:  Object.freeze({ Platinum: 1.50, Diamond: 1.32, Gold: 1.13, Silver: 0.85, Bronze: 0.57 }),
  1000: Object.freeze({ Platinum: 1.40, Diamond: 1.22, Gold: 1.05, Silver: 0.78, Bronze: 0.52 })
});

export function getMedalStandards(totalDigits) {
  const requested = Number(totalDigits);
  const mode = MODES.includes(requested)
    ? requested
    : MODES.reduce((closest, current) =>
        Math.abs(current - requested) < Math.abs(closest - requested) ? current : closest
      );

  const speeds = MEDAL_SPEEDS_BY_MODE[mode];

  return MEDALS.map(medal => ({
    ...medal,
    digitsPerSecond: speeds[medal.name],
    secondsPerDigit: 1 / speeds[medal.name],
    targetTimeMs: requested / speeds[medal.name] * 1000
  }));
}
