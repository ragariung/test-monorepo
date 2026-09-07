# Product Knowledge

Research/reference notes behind the six fictional PRAXIS Insurance products seeded into this MVP (`Backends/prisma/seed.ts` / originally `Frontends/src/data/mockData.ts`). This folder exists so a non-technical stakeholder can understand *why* each dummy product looks the way it does, without reading code.

**Important — compliance boundary (see `../PRD.md` §9):** every number in these files (sum assured bands, premium rates, age ranges) is **fictional MVP engineering data**, not a real quote from any insurer. This folder documents *general, publicly-observable patterns* in the Indonesian individual life/health insurance market — typical product categories, typical structuring of benefits, typical entry-age and sum-assured ranges — and shows how each PRAXIS product was shaped to be *representative* of those patterns. It does not reproduce, quote, or rely on any specific insurer's proprietary rate card, policy wording, or copyrighted marketing copy. `PRD.md`'s own references section (§10, items 1–4) already names the four companies used as general market benchmarks: Allianz Indonesia, AXA Indonesia, and Prudential Indonesia; this folder extends that same benchmarking exercise product-by-product, and additionally uses AIA Indonesia as a fourth reference point for typical critical-illness and whole-life structuring.

All figures are in **IDR (Indonesian Rupiah)**, matching the rest of this project.

---

## Index

| File | PRAXIS product | Category | General market pattern it represents |
|---|---|---|---|
| [`praxis-jiwa-utama.md`](praxis-jiwa-utama.md) | PRAXIS Jiwa Utama | Whole life protection | Allianz LegacyPro / Prudential PRUMapan / AIA whole-life style: lifetime death benefit, flexible limited-pay term |
| [`praxis-sehat-mandiri.md`](praxis-sehat-mandiri.md) | PRAXIS Sehat Mandiri | Critical illness | AXA/AIA critical-illness riders and standalone CI plans: multi-stage payout, lump-sum on diagnosis |
| [`praxis-warisan-pintar.md`](praxis-warisan-pintar.md) | PRAXIS Warisan Pintar | Family/estate protection | Allianz/Prudential legacy-planning positioning: large sum assured, wealth-transfer framing |
| [`praxis-cendekia.md`](praxis-cendekia.md) | PRAXIS Cendekia | Education endowment | AXA/Prudential dwiguna pendidikan pattern: staged payouts timed to school milestones |
| [`praxis-dana-sejahtera.md`](praxis-dana-sejahtera.md) | PRAXIS Dana Sejahtera | Savings/endowment | Conservative endowment pattern: guaranteed maturity value + attached life cover |
| [`praxis-investa-syariah.md`](praxis-investa-syariah.md) | PRAXIS Investa Syariah | Sharia unit-linked | AXA/Allianz/Prudential syariah unit-link pattern: tabarru' + investment component, DPS oversight |

## General patterns observed across the Indonesian market (grounding context)

These are the recurring structural patterns across Allianz, AXA, Prudential, and AIA's individual life/health product lines in Indonesia, used to keep the PRAXIS catalogue representative:

- **Entry age ranges** typically span roughly 18–65 for adult life/health products, sometimes as low as 30 days for child-linked education plans.
- **Sum assured** is usually expressed in round IDR bands — commonly starting around Rp100–200 million at the low end for mass-market plans, scaling into the billions (Rp1–10 miliar) for affluent/legacy-planning products.
- **Payment terms** are commonly offered as a fixed menu (e.g. 5/10/15/20 years) rather than continuous, with shorter terms carrying a higher annual premium to complete funding sooner.
- **Payment frequency** options are almost always monthly/quarterly/semi-annual/annual, with a modest discount for paying less frequently (annual cheapest per-year).
- **Product documentation** consistently includes a RIPLAY (Ringkasan Informasi Produk dan Layanan) and a formal brochure, per OJK requirements referenced in `PRD.md` §9.
- **Every illustration carries an explicit disclaimer** that the figure is not a final quote — underwriting determines the actual premium. PRAXIS's simulator disclaimer (`Backends/src/simulator/simulator.service.ts`) mirrors this.

## How this maps to the seed data

Each per-product file's structured spec (age range, sum assured band, payment terms, benefits, eligibility) matches `Backends/prisma/seed.ts`'s `SEED_PRODUCTS` entry for that product exactly, field for field. If the seed data changes, update the matching file here in the same change (informal convention — this folder doesn't carry a revision-history table like `DATA-STRUCTURE.md`/`FOLDER-STRUCTURE.md`/`API-LIST-V0.md`, since it documents product *content*, not system structure).
