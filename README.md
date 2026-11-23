# Spain salary & tax calculator 2026 (+ 20-country comparator, Dubai, US, UAE gratuity, D'Hondt)

Free, open-source calculators and open data from **[borbur.net](https://borbur.net)** by Borja Burguillos:

- **Salary tax comparator, 20 countries (2026)**: take-home pay, income tax, employee and employer social security and the full tax wedge for the same salary in Spain, Portugal, France, Germany, Italy, the Netherlands, Belgium, Ireland, the UK, Switzerland, Sweden, Poland, the United States, Canada, Mexico, the UAE, Singapore, Japan, Russia and China, at market exchange rates or purchasing power
- **Spain net salary 2026**: gross to net with the official AEAT 2026 withholding algorithm and 2026 Social Security rates
- **Beckham Law** (Spain's 24% regime for people moving to Spain) vs the normal regime
- **US take-home pay 2026**: federal income tax (single, standard deduction) + FICA
- **Spain vs Dubai** and **Spain vs US** salary equivalents (the gross that leaves the same net)
- **UAE end-of-service gratuity** (Federal Decree-Law 33 of 2021)
- **D'Hondt** seat allocation as in Spain's general elections (3% threshold, blank votes count as valid)

The numbers are the same ones shown on borbur.net, and the code is checked against the site's build for parity (1,437 test values, 0 mismatches). Estimates for comparison, not tax advice.

## Use it without code

- Web calculators: [Salary tax comparator, 20 countries](https://borbur.net/tools/salary-tax-comparator/) · [Spain net salary](https://borbur.net/tools/spain-net-salary-calculator/) · [Beckham Law](https://borbur.net/tools/beckham-law-calculator/) · [UAE gratuity](https://borbur.net/tools/uae-gratuity-calculator/) · [D'Hondt](https://borbur.net/tools/dhondt-calculator/) · [all tools](https://borbur.net/tools/)
- **JSON API** (free, no key, CORS open): `https://borbur.net/api/spain-net-salary?gross=50000` · `https://borbur.net/api/salary-tax-comparator?gross=60000&currency=EUR` · [list of endpoints](https://borbur.net/api/)
- **MCP server for AI assistants** (Streamable HTTP, no sign-in): `https://borbur.net/mcp`. In Claude: Settings → Connectors → Add custom connector. [Docs](https://borbur.net/developers/)
- **Embed on your website**: the 20-country comparator and the D'Hondt calculator can be embedded with an iframe. Copy the code from the “Put this on your website” box on each tool page.

## JavaScript

```js
import { spainNet, beckham, usNet, spanishSalaryInDubai, uaeGratuity, dhondt } from "./js/index.mjs";
spainNet(50000).net;                       // 35550
spanishSalaryInDubai(50000).dubai_monthly_aed_same_net; // 12024
uaeGratuity(10000, 7 * 365).gratuity_aed;  // 55000
```

## Python

```python
import borbur_calc as b          # python/borbur_calc
b.spain_net(50000)["net"]        # 35550.0
b.us_net(100000)["net"]          # 79180.0
b.dhondt(7, {"A": 340000, "B": 280000, "C": 160000}, blank=5000)["seats"]
```

Run the tests: `python3 tests/test_values.py`

## Open data (CC BY 4.0)

| Dataset | Rows | Files |
|---|---|---|
| [Tax on salaries 2026: 20 countries at €30,000, €60,000 and €120,000](https://borbur.net/topics/salary-tax-2026-20-countries/) | 60 | [CSV](https://borbur.net/data/salary-tax-2026.csv) · [JSON](https://borbur.net/data/salary-tax-2026.json) |
| [Spain net salary 2026 (gross to net)](https://borbur.net/tools/spain-net-salary/) | 27 | [CSV](data/spain-net-salary-2026.csv) · [JSON](https://borbur.net/data/spain-net-salary-2026.json) |
| [Spain net salary by region 2026 (13 regions)](https://borbur.net/tools/spain-net-salary/by-region/) | 195 | [CSV](data/spain-net-salary-by-region-2026.csv) · [JSON](https://borbur.net/data/spain-net-salary-by-region-2026.json) |
| [Beckham Law vs normal regime by salary 2026](https://borbur.net/tools/beckham-law-calculator/salaries/) | 15 | [CSV](data/spain-beckham-law-by-salary-2026.csv) · [JSON](https://borbur.net/data/spain-beckham-law-by-salary-2026.json) |
| [Dubai salary → Spanish gross that matches](https://borbur.net/tools/dubai-salary-in-spain/) | 15 | [CSV](data/dubai-salary-in-spain-2026.csv) · [JSON](https://borbur.net/data/dubai-salary-in-spain-2026.json) |
| [Spanish salary → Dubai pay that matches](https://borbur.net/tools/spanish-salary-in-dubai/) | 14 | [CSV](data/spanish-salary-in-dubai-2026.csv) · [JSON](https://borbur.net/data/spanish-salary-in-dubai-2026.json) |
| [US salary → Spanish gross that matches](https://borbur.net/tools/us-salary-in-spain/) | 10 | [CSV](data/us-salary-in-spain-2026.csv) · [JSON](https://borbur.net/data/us-salary-in-spain-2026.json) |
| [Spanish salary → US pay that matches](https://borbur.net/tools/spanish-salary-in-the-us/) | 8 | [CSV](data/spanish-salary-in-the-us-2026.csv) · [JSON](https://borbur.net/data/spanish-salary-in-the-us-2026.json) |
| [UAE end-of-service gratuity by years of service](https://borbur.net/tools/uae-gratuity/) | 147 | [CSV](data/uae-gratuity-by-years.csv) · [JSON](https://borbur.net/data/uae-gratuity-by-years.json) |
| [Spain 2026 election: electors per seat by constituency](https://borbur.net/topics/votes-per-seat-spain/) | 52 | [CSV](data/spain-electors-per-seat-2026.csv) · [JSON](https://borbur.net/data/spain-electors-per-seat-2026.json) |

All datasets are also listed at [borbur.net/data](https://borbur.net/data/).

## Assumptions and sources

- **20-country comparator**: 2026 rules for a single employee with no children; national and permanent-resident rates, with an expatriate switch for the UAE and Singapore. Exchange rates: ECB reference rates of 20 Nov 2026 (Bank of Russia for the rouble; the dirham at its 3.6725 peg). Purchasing power: World Bank PPP factors for private consumption, 2025. Every rule and source is listed on the [tool page](https://borbur.net/tools/salary-tax-comparator/).
- **Spain**: 2026 AEAT withholding algorithm; single employee under 65, no children, permanent contract; 2026 Social Security rates and MEI (Orden PJC/297/2026). Regional tables use each region's 2026 income tax scale.
- **US**: IRS 2026 inflation adjustments (Rev. Proc. 2025-32, incl. the One Big Beautiful Bill): standard deduction $16,100; Social Security 6.2% up to $184,500; Medicare 1.45% + 0.9% above $200,000. No state income tax.
- **Exchange rates** (Spain–US and Spain–Dubai tables): €1 = $1.0989 (ECB, 17 Nov 2026); €1 = Dh4.0588 (ECB dollar rate of 13 Nov 2026 × the dirham's 3.6725 peg).
- **UAE gratuity**: 21 days of basic salary per year for the first 5 years, 30 days after, capped at 24 months of basic salary.
- **Elections**: seats per Royal Decree 806/2026; electors per INE roll of 9 Oct 2026.

## Related open data

- **[Digital money for HR](https://github.com/Borbur14/digital-money-for-hr)**: a bilingual (EN/ES) glossary of 60 stablecoin, token and pay terms, and a stablecoin job map (CC BY 4.0).
- More calculators (UK take-home pay, Spain minimum wage 2027, a digital-money readiness check) are available through the [MCP server and API](https://borbur.net/developers/).

## About the author

[Borja Burguillos](https://borbur.net/about/) writes about money, pay and work. His books: *[Why Bitcoin Had to Exist](https://borbur.net/books/why-bitcoin-had-to-exist/)* (in Spanish, *[Por qué existe Bitcoin](https://borbur.net/es/libros/por-que-existe-bitcoin/)*; [read chapter 1 free](https://borbur.net/books/why-bitcoin-had-to-exist/chapter-1/)), *[Stablecoins for a Better World](https://borbur.net/books/stablecoins-for-a-better-world/)* and *[Beyond the Game](https://borbur.net/books/beyond-the-game/)*.

## Licence and credit

Code: MIT. Data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Please credit **“Borja Burguillos, borbur.net”** with a link to [borbur.net](https://borbur.net).

---

## En español

Calculadoras y datos abiertos de **[borbur.net](https://borbur.net/es/)**: [comparador de impuestos sobre el sueldo en 20 países](https://borbur.net/es/herramientas/comparador-impuestos-sueldo/) (2026), sueldo neto en España 2026 con el algoritmo oficial de retenciones de la AEAT, Ley Beckham, sueldo neto en EE. UU., equivalencias de sueldos España–Dubái y España–EE. UU., indemnización por fin de servicio en Emiratos y reparto de escaños con D'Hondt. API gratuita en `https://borbur.net/api/` y servidor MCP en `https://borbur.net/mcp`. Datos con licencia CC BY 4.0: cita «Borja Burguillos, borbur.net» con un enlace. [Datos abiertos](https://borbur.net/es/datos/) · [Desarrolladores](https://borbur.net/es/desarrolladores/) · [Lee gratis el capítulo 1 de Por qué existe Bitcoin](https://borbur.net/es/libros/por-que-existe-bitcoin/capitulo-1/)
