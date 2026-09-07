# PRAXIS Warisan Pintar

**Category:** Family/estate protection (`family`) · **Slug:** `praxis-warisan-pintar` · **Badge:** Solusi Waris (Estate Solution)

## Market pattern this represents

Modeled on the "legacy planning" positioning used by Allianz and Prudential for their higher-sum-assured individual life products, marketed less as basic protection and more as a wealth-transfer/estate-planning tool for affluent families. The common pitch across insurers in this segment: designate beneficiaries so proceeds bypass lengthy probate/inheritance-dispute processes, offer fast claim liquidity, and sometimes offer multi-currency options for internationally-exposed families.

## Why these numbers

- **Entry age 25–65**: skews older/higher-earning than the base life product (25 floor vs. 18), matching how legacy-planning products are marketed toward established professionals and parents rather than young first-time buyers.
- **Sum assured Rp500 million – Rp10 miliar**: the highest band in the PRAXIS catalogue, reflecting this segment's actual target: high-net-worth estate planning, not mass-market protection.
- **Only 5/10-year payment terms**: legacy-planning buyers in this market are typically offered shorter, front-loaded payment structures (finish paying quickly, then let the policy sit for decades), unlike mass-market products that offer longer terms to keep premiums affordable.
- **IDR + USD currency option**: reflects a real pattern among Indonesian insurers' affluent-segment products, which often offer USD-denominated variants for clients wanting currency diversification — noted here as a benefit even though the MVP itself only processes IDR (see `PRD.md`/`ARCHITECTURE-ESSENTIAL.md`: this MVP is IDR-only; the USD mention is product-content flavor only, not a system capability).
- **7-day claim turnaround**: legacy/estate products commonly advertise faster claims processing as a key differentiator versus mass-market plans, since speed of liquidity is the actual value proposition being sold.

## Structured spec

| Field | Value |
|---|---|
| Tagline | Perencanaan transfer kekayaan keluarga terstruktur dengan jaminan kepastian hukum. |
| Target audience | Parents securing their children's future financial independence; families with property assets needing cash liquidity for inheritance tax; business owners planning structured asset distribution |
| Age range | 25–65 |
| Sum assured | Rp500,000,000 – Rp10,000,000,000 |
| Payment terms | 5, 10 years |
| Coverage duration | 99 years (whole life) |
| Base annual rate / million | 28.0 |

**Key benefits:** protected beneficiary designation (sum assured goes directly to named heirs, bypassing inheritance-dispute court proceedings); fast, certain liquidity (paid within 7 business days of complete claim documentation); currency flexibility (IDR and USD denominations offered as a product feature).

**Coverage table:** guaranteed death benefit → 100% sum assured + cash value, paid in full to the named child/heir.

**Eligibility:** entry age (policyholder & insured) 25–65; family card and heir birth certificate required at extended verification.

**Documents:** RIPLAY.
