// spain-salary-calculator-2026 — https://borbur.net (Borja Burguillos). MIT licence.
// Same engine as the borbur.net API (/api/*) and MCP server (/mcp).
// Same formulas as the borbur.net pages (checked against the Python site build for parity).
export const META = {
  source: "https://borbur.net", author: "Borja Burguillos", license: "CC BY 4.0 (data), MIT (code)",
  fx: { eur_aed: 4.0588, eur_aed_basis: "ECB EUR/USD 1.1052 (13 Nov 2026) x AED peg 3.6725", eur_usd: 1.0989, eur_usd_basis: "ECB reference rate, 17 Nov 2026" },
  disclaimer: "Estimates for comparison, not tax or legal advice."
};
const R2 = (x) => Math.round(x * 100) / 100;
const R0 = (x) => Math.floor(x + 0.5);
// ---------- Spain 2026: AEAT withholding algorithm, single, no children, under 65, permanent contract
const SC = [[0, 12450, 0, .19], [12450, 20200, 2365.5, .24], [20200, 35200, 4225.5, .30], [35200, 60000, 8725.5, .37], [60000, 300000, 17901.5, .45], [300000, 1e18, 125901.5, .47]];
function esc(b) { if (b <= 0) return 0; for (const [lo, hi, c, r] of SC) if (b <= hi) return c + (b - lo) * r; }
function ssEmployee(g) {
  let cot = Math.min(g, 5101.20 * 12) * (0.047 + 0.0155 + 0.001 + 0.0015);
  const ex = Math.max(g / 12 - 5101.20, 0);
  cot += (Math.min(ex, 510.12) * .0019 + Math.min(Math.max(ex - 510.12, 0), 2040.48) * .0021 + Math.max(ex - 2550.60, 0) * .0024) * 12;
  return cot;
}
export function spainNet(g) {
  const cot = ssEmployee(g);
  const rnt = Math.max(g - cot, 0), otros = Math.min(2000, rnt);
  let red; if (rnt <= 14852) red = 7302; else if (rnt <= 17673.52) red = 7302 - 1.75 * (rnt - 14852); else if (rnt < 19747.5) red = 2364.34 - 1.14 * (rnt - 17673.52); else red = 0;
  const base = Math.max(rnt - otros - Math.min(red, rnt - otros), 0);
  let cuota = Math.max(esc(base) - esc(5550), 0);
  if (g <= 15876) cuota = 0; else if (g <= 35200) cuota = Math.min(cuota, (g - 15876) * .43);
  const tipo = Math.floor(cuota / g * 10000) / 100;
  const ret = g * tipo / 100, net = g - cot - ret;
  return { gross: g, social_security: R2(cot), withholding_rate_pct: tipo, withholding: R2(ret), net: R2(net), net_month_12: R2(net / 12), net_month_14: R2(net / 14) };
}
// ---------- Spain Beckham Law vs normal regime (annual tax, 2026)
const BSC = [[0, 12450, 0, 19], [12450, 20200, 2365.5, 24], [20200, 35200, 4225.5, 30], [35200, 60000, 8725.5, 37], [60000, 300000, 17901.5, 45], [300000, 1e18, 125901.5, 47]];
function besc(b) { if (b <= 0) return 0; for (const [lo, hi, c, r] of BSC) if (b <= hi) return c + (b - lo) * r / 100; }
function bss(g) { const ex = Math.max(g / 12 - 5101.20, 0); return Math.min(g, 61214.40) * 0.065 + (Math.min(ex, 510.12) * 0.19 + Math.min(Math.max(ex - 510.12, 0), 2040.48) * 0.21 + Math.max(ex - 2550.60, 0) * 0.24) / 100 * 12; }
export function beckham(g) {
  const cot = bss(g), rnt = Math.max(g - cot, 0), otros = Math.min(2000, rnt);
  let red; if (rnt <= 14852) red = 7302; else if (rnt <= 17673.52) red = 7302 - 1.75 * (rnt - 14852); else if (rnt < 19747.5) red = 2364.34 - 1.14 * (rnt - 17673.52); else red = 0;
  const rntr = rnt - otros; red = Math.min(red, rntr); const base = Math.max(rntr - red, 0);
  const taxN = Math.max(besc(base) - besc(5550), 0), taxB = Math.min(g, 600000) * 0.24 + Math.max(g - 600000, 0) * 0.47;
  return { gross: g, social_security: R2(cot), normal: { income_tax: R2(taxN), net: R2(g - cot - taxN) }, beckham: { income_tax: R2(taxB), net: R2(g - cot - taxB) }, beckham_saves: R2(taxN - taxB) };
}
// ---------- USA 2026 federal (single, standard deduction) + FICA, no state income tax
const USBR = [[0, 12400, .10], [12400, 50400, .12], [50400, 105700, .22], [105700, 201775, .24], [201775, 256225, .32], [256225, 640600, .35], [640600, 1e18, .37]];
export function usNet(g) {
  const ti = Math.max(g - 16100, 0); let fed = 0;
  for (const [lo, hi, r] of USBR) if (ti > lo) fed += (Math.min(ti, hi) - lo) * r;
  const ss = Math.min(g, 184500) * .062, med = g * .0145 + Math.max(g - 200000, 0) * .009;
  return { gross: g, federal_income_tax: R2(fed), social_security_medicare: R2(ss + med), net: R2(g - fed - ss - med), note: "No state income tax (e.g. Texas, Florida); states such as California or New York add more." };
}
function bsearch(f, target) { let lo = Math.floor(target), hi = Math.floor(target * 3); while (lo < hi) { const m = Math.floor((lo + hi) / 2); if (f(m) >= target - 0.5) hi = m; else lo = m + 1; } return lo; }
const spainNetRaw = (g) => { const d = spainNet(g); return d.net; };
const usNetRaw = (g) => usNet(g).net;
// ---------- Cross-country comparisons (same as borbur.net pages)
export function dubaiSalaryInSpain(aedMonth) {
  const e = aedMonth * 12 / META.fx.eur_aed, g = bsearch(spainNetRaw, e);
  return { dubai_monthly_aed: aedMonth, dubai_yearly_eur: R2(e), spain_gross_needed_eur: g, spain_gross_month_12: R2(g / 12), ratio: R2(g / e), spain_breakdown: spainNet(g) };
}
export function spanishSalaryInDubai(g) {
  const s = spainNet(g), dm = R0(s.net * META.fx.eur_aed / 12);
  return { spain_gross_eur: g, spain_net_eur: s.net, dubai_monthly_aed_same_net: dm, dubai_yearly_aed_same_net: dm * 12, same_gross_in_dubai_monthly_aed: R2(g * META.fx.eur_aed / 12), extra_net_at_same_gross_eur: R2(g - s.net), extra_pct: R2((g / s.net - 1) * 100) };
}
export function usSalaryInSpain(usd) {
  const u = usNet(usd), e = u.net / META.fx.eur_usd, sg = bsearch(spainNetRaw, e);
  return { us_gross_usd: usd, us_net_usd: u.net, us_net_eur: R2(e), spain_gross_needed_eur: sg, spain_gross_month_12: R2(sg / 12), us_breakdown: u, spain_breakdown: spainNet(sg) };
}
export function spanishSalaryInUs(g) {
  const s = spainNet(g), d = s.net * META.fx.eur_usd, ug = bsearch(usNetRaw, d);
  return { spain_gross_eur: g, spain_net_eur: s.net, spain_net_usd: R2(d), us_gross_needed_usd: ug, us_breakdown: usNet(ug) };
}
// ---------- UAE end-of-service gratuity (private sector, unlimited contract): 21 days/yr for years 1-5, 30 after, cap 24 months of basic
export function uaeGratuity(basicMonthly, days) {
  if (days < 365) return { eligible: false, days_of_service: days, note: "Less than one year of service: no gratuity." };
  const y = days / 365, d1 = Math.min(y, 5) * 21, d2 = Math.max(y - 5, 0) * 30, dd = d1 + d2, cap = basicMonthly * 24;
  const g30 = dd * basicMonthly / 30, g365 = dd * basicMonthly * 12 / 365;
  return { eligible: true, basic_monthly_aed: basicMonthly, years_of_service: R2(y), gratuity_days: R2(dd), gratuity_aed: R2(Math.min(g30, cap)), gratuity_aed_365_day_method: R2(Math.min(g365, cap)), cap_aed: cap, cap_hit: g30 > cap };
}
// ---------- D'Hondt (LOREG art. 163): threshold on valid votes incl. blank; ties -> more total votes, then lot
export const PROVINCES = {"Madrid": 38, "Asturias": 7, "A Coruña": 8, "Barcelona": 32, "Sevilla": 12, "Santa Cruz de Tenerife": 7, "Pontevedra": 7, "Cádiz": 8, "Valencia": 16, "Bizkaia": 8, "Málaga": 11, "Las Palmas": 8, "Murcia": 10, "Alicante": 12, "Granada": 7, "Badajoz": 5, "Illes Balears": 8, "Zaragoza": 7, "Córdoba": 6, "Navarra": 5, "León": 4, "Cantabria": 5, "Tarragona": 6, "Jaén": 5, "Gipuzkoa": 6, "Girona": 6, "Toledo": 6, "Almería": 6, "Ourense": 4, "Castellón": 5, "Valladolid": 5, "Lugo": 4, "Cáceres": 4, "Huelva": 5, "Lleida": 4, "Ciudad Real": 5, "Albacete": 4, "Salamanca": 4, "Burgos": 4, "Guadalajara": 3, "Álava": 4, "Ceuta": 1, "La Rioja": 4, "Melilla": 1, "Huesca": 3, "Zamora": 3, "Cuenca": 3, "Palencia": 3, "Ávila": 3, "Segovia": 3, "Soria": 2, "Teruel": 3};
export function dhondt(seats, parties, blank = 0, threshold = 3) {
  const ps = parties.filter((p) => p.votes > 0).map((p, i) => ({ n: String(p.name), v: Math.floor(p.votes), i }));
  let valid = blank; ps.forEach((p) => { valid += p.v; });
  const cut = valid * threshold / 100, Q = [], seat = ps.map(() => 0), ok = ps.map((p) => p.v > 0 && p.v >= cut);
  ps.forEach((p, k) => { if (ok[k]) for (let d = 1; d <= seats; d++) Q.push({ k, i: p.i, v: p.v, d }); });
  Q.sort((a, b) => (b.v * a.d - a.v * b.d) || (b.v - a.v) || (a.i - b.i));
  for (let j = 0; j < Math.min(seats, Q.length); j++) seat[Q[j].k]++;
  const lot = Q.length > seats && seats > 0 && Q[seats - 1].v * Q[seats].d === Q[seats].v * Q[seats - 1].d && Q[seats - 1].v === Q[seats].v && Q[seats - 1].k !== Q[seats].k;
  return { seats, valid_votes: valid, threshold_pct: threshold, threshold_votes: R2(cut), tie_for_last_seat_by_lot: lot,
    results: ps.map((p, k) => ({ party: p.n, votes: p.v, above_threshold: ok[k], seats: seat[k] })).sort((a, b) => b.seats - a.seats || b.votes - a.votes) };
}
