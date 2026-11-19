"""borbur_calc: Spain 2026 net salary (AEAT withholding algorithm), Beckham Law, US take-home pay,
Spain vs Dubai / Spain vs US salary equivalents, UAE end-of-service gratuity and the D'Hondt method.
Same formulas as https://borbur.net (Borja Burguillos). MIT licence. Estimates for comparison, not tax advice."""
import math
__version__ = "1.0.0"
EUR_AED = 4.0588   # ECB EUR/USD 1.1052 (13 Nov 2026) x AED peg 3.6725
EUR_USD = 1.0989   # ECB reference rate, 17 Nov 2026
_SC = [(0, 12450, 0, .19), (12450, 20200, 2365.5, .24), (20200, 35200, 4225.5, .30), (35200, 60000, 8725.5, .37), (60000, 300000, 17901.5, .45), (300000, 1e18, 125901.5, .47)]
def _esc(b):
    if b <= 0: return 0
    for lo, hi, c, r in _SC:
        if b <= hi: return c + (b - lo) * r
def _ss(g):
    cot = min(g, 5101.20 * 12) * (0.047 + 0.0155 + 0.001 + 0.0015)
    ex = max(g / 12 - 5101.20, 0)
    return cot + (min(ex, 510.12) * .0019 + min(max(ex - 510.12, 0), 2040.48) * .0021 + max(ex - 2550.60, 0) * .0024) * 12
def _red(rnt):
    if rnt <= 14852: return 7302
    if rnt <= 17673.52: return 7302 - 1.75 * (rnt - 14852)
    if rnt < 19747.5: return 2364.34 - 1.14 * (rnt - 17673.52)
    return 0
def spain_net(gross):
    """Spain 2026: single employee, no children, under 65, permanent contract (AEAT withholding algorithm)."""
    g = gross; cot = _ss(g); rnt = max(g - cot, 0); otros = min(2000, rnt)
    base = max(rnt - otros - min(_red(rnt), rnt - otros), 0)
    cuota = max(_esc(base) - _esc(5550), 0)
    if g <= 15876: cuota = 0
    elif g <= 35200: cuota = min(cuota, (g - 15876) * .43)
    tipo = math.floor(cuota / g * 10000) / 100
    ret = g * tipo / 100; net = g - cot - ret
    return {"gross": g, "social_security": round(cot, 2), "withholding_rate_pct": tipo, "withholding": round(ret, 2), "net": round(net, 2),
            "net_month_12": round(net / 12, 2), "net_month_14": round(net / 14, 2)}
def _bss(g):
    ex = max(g / 12 - 5101.20, 0)
    return min(g, 61214.40) * 0.065 + (min(ex, 510.12) * 0.19 + min(max(ex - 510.12, 0), 2040.48) * 0.21 + max(ex - 2550.60, 0) * 0.24) / 100 * 12
def beckham(gross):
    """Spain 2026 annual tax: normal regime vs Beckham Law (24% up to EUR 600,000, 47% above)."""
    g = gross; cot = _bss(g); rnt = max(g - cot, 0); otros = min(2000, rnt); rntr = rnt - otros
    base = max(rntr - min(_red(rnt), rntr), 0)
    tn = max(_esc(base) - _esc(5550), 0); tb = min(g, 600000) * 0.24 + max(g - 600000, 0) * 0.47
    return {"gross": g, "social_security": round(cot, 2), "normal": {"income_tax": round(tn, 2), "net": round(g - cot - tn, 2)},
            "beckham": {"income_tax": round(tb, 2), "net": round(g - cot - tb, 2)}, "beckham_saves": round(tn - tb, 2)}
_USBR = [(0, 12400, .10), (12400, 50400, .12), (50400, 105700, .22), (105700, 201775, .24), (201775, 256225, .32), (256225, 640600, .35), (640600, 1e18, .37)]
def us_net(gross):
    """US 2026: single filer, standard deduction ($16,100), federal income tax + FICA, no state income tax."""
    g = gross; ti = max(g - 16100, 0); fed = sum((min(ti, hi) - lo) * r for lo, hi, r in _USBR if ti > lo)
    fica = min(g, 184500) * .062 + g * .0145 + max(g - 200000, 0) * .009
    return {"gross": g, "federal_income_tax": round(fed, 2), "social_security_medicare": round(fica, 2), "net": round(g - fed - fica, 2)}
def _bsearch(f, target):
    lo, hi = int(target), int(target * 3)
    while lo < hi:
        m = (lo + hi) // 2
        if f(m) >= target - 0.5: hi = m
        else: lo = m + 1
    return lo
def dubai_salary_in_spain(aed_month):
    e = aed_month * 12 / EUR_AED; g = _bsearch(lambda x: spain_net(x)["net"], e)
    return {"dubai_monthly_aed": aed_month, "dubai_yearly_eur": round(e, 2), "spain_gross_needed_eur": g}
def spanish_salary_in_dubai(gross):
    n = spain_net(gross)["net"]; dm = math.floor(n * EUR_AED / 12 + 0.5)
    return {"spain_gross_eur": gross, "spain_net_eur": n, "dubai_monthly_aed_same_net": dm, "extra_net_at_same_gross_eur": round(gross - n, 2)}
def us_salary_in_spain(usd):
    n = us_net(usd)["net"]; e = n / EUR_USD
    return {"us_gross_usd": usd, "us_net_usd": n, "us_net_eur": round(e, 2), "spain_gross_needed_eur": _bsearch(lambda x: spain_net(x)["net"], e)}
def spanish_salary_in_us(gross):
    n = spain_net(gross)["net"]; d = n * EUR_USD
    return {"spain_gross_eur": gross, "spain_net_eur": n, "spain_net_usd": round(d, 2), "us_gross_needed_usd": _bsearch(lambda x: us_net(x)["net"], d)}
def uae_gratuity(basic_monthly, days):
    """UAE private sector (Decree-Law 33/2021): 21 days of basic per year for years 1-5, 30 after, cap 24 months."""
    if days < 365: return {"eligible": False, "days_of_service": days}
    y = days / 365; dd = min(y, 5) * 21 + max(y - 5, 0) * 30; cap = basic_monthly * 24
    g30, g365 = dd * basic_monthly / 30, dd * basic_monthly * 12 / 365
    return {"eligible": True, "years_of_service": round(y, 2), "gratuity_days": round(dd, 2), "gratuity_aed": round(min(g30, cap), 2),
            "gratuity_aed_365_day_method": round(min(g365, cap), 2), "cap_hit": g30 > cap}
def dhondt(seats, votes, blank=0, threshold=3.0):
    """votes: dict party -> votes. Threshold over valid votes (incl. blank), as in Spain (LOREG art. 163)."""
    ps = [(n, v, i) for i, (n, v) in enumerate(votes.items()) if v > 0]
    valid = blank + sum(v for _, v, _ in ps); cut = valid * threshold / 100
    q = [(v / d, v, -i, n) for n, v, i in ps if v >= cut for d in range(1, seats + 1)]
    q.sort(reverse=True)
    out = {n: 0 for n, _, _ in ps}
    for _, _, _, n in q[:seats]: out[n] += 1
    return {"valid_votes": valid, "threshold_votes": cut, "seats": out}
