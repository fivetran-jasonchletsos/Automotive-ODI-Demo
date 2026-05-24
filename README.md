# Pinnacle Motors — Automotive ODI Demo

A reference build of Fivetran's Open Data Infrastructure for automotive: an OEM with four
assembly plants, a 280-dealer franchise network, and 1.2M connected vehicles unified on
Apache Iceberg. Speaks to a Chief Data Officer who has to reconcile OEM-side data (SAP S/4HANA),
dealer-side data (Dealertrack DMS), and connected-car telemetry on the same governed lake.

Live demo: https://fivetran-jasonchletsos.github.io/Automotive-ODI-Demo/

## What this demonstrates

- Customer-owned storage on Apache Iceberg (S3 + Glue catalog).
- Fivetran connectors landing six sources into Iceberg (MDLS) on S3 — one copy of the bytes, open format.
- Snowflake, Athena, and Trino reading the same Iceberg bytes via external catalogs — no copies, no extracts.
- Fivetran Transformations triggering dbt Labs the moment the source sync finishes; bronze → silver → gold stays in Iceberg.

## Canonical pipeline flow

```
[Source]  →  Fivetran  →  Iceberg (MDLS)  →  Snowflake / Athena / Trino  →  dbt Labs  →  React
  SAP                       on S3                  external                triggered     SPA
  Dealertrack              (Apache              Iceberg reads             by Fivetran    on
  Manheim                  Iceberg v2)          (no copies,                Transformations  Pages
  Telemetry                                     no extracts)
  Salesforce
  J.D. Power
```

bronze → silver → gold layers all live in Iceberg. Snowflake is the primary compute; Athena
and Trino read the same files for ad-hoc and lake-native workloads.

## Data sources (synthetic)

- SAP S/4HANA — OEM ERP, plant production, BOM
- Dealertrack DMS — 280 dealers, inventory, CSI, F&I
- Cox Automotive Manheim — wholesale used-vehicle feed
- Connected-car telemetry stream (simulated Kafka)
- Salesforce Service Cloud — warranty + customer cases
- J.D. Power IQS / APEAL — segment benchmarks

## Pages

- `/` — Operations console: KPIs, US map of plants and top dealers, top 3 quality issues.
- `/dealers` — 280-dealer network health, region rollups, top/bottom performers.
- `/connected-car` — 1.2M-vehicle fleet, DTCs, OTA, predictive maintenance, EV charging telemetry.
- `/quality` — warranty claims by part family, top 5 issues with root-cause status.
- `/architecture` — schematic of the ODI reference architecture.
- `/pipeline` — connector status, dbt layers, failure simulator.
- `/policy` — why automotive data is fragmented and how ODI bridges it.
- `/about` — the canonical ODI Story and the Pinnacle pitch.

## Local development

```bash
cd pinnacle-app/frontend
npm install
VITE_BASE=/ npm run dev
```

## Build

```bash
cd pinnacle-app/frontend
npm run build
```

The build base path is `/Automotive-ODI-Demo/` (GitHub Pages). Override with `VITE_BASE=/`.

## Disclaimer

All data is synthetic. Pinnacle Motors is a fictional OEM. Nameplates, dealers, VINs, DTCs,
warranty claims, and J.D. Power positioning are illustrative only.
