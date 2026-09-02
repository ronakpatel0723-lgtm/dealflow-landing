# DealFlow AI — front end

The web front end for DealFlow AI: an M&A screening model that ranks public software,
cybersecurity, fintech and healthtech companies by acquisition likelihood, published
alongside the evidence that it works.

This is a research artifact, not a product. There is no signup, no auth, no paid tier,
and no live compute. Every number on the site is read from a static export of one
validated model run, so the site cannot fail in front of a reader and costs nothing to
serve.

## Headline results

| Evaluation | Lift @ top decile | Placebo (shuffled labels) | Signal-to-noise |
|---|---|---|---|
| Single out-of-time cut, 2022–2023 | 4.59× | 0.75× | 6.09× |
| Rolling 3-fold walk-forward (2021/2022/2023) | 4.91× mean | 1.16× mean | **4.27×** |

The 4.27× rolling figure is the headline. It is the mean of the three per-fold ratios,
not the ratio of the means, and it is deliberately the more conservative of the two
numbers — one cut is one draw, and quoting only the best window would be cherry-picking.

Panel: 30,715 company-quarters across 967 entities, 2009-Q4 through 2024-Q3, 397
positives (1.11% base rate). Ground truth is 203 acquisitions verified against the body
of the SEC 8-K filing, not a deal database. Seed 42. Full per-fold lift, placebo, PR-AUC
and leakage-audit output live in `results/walk_forward.json` in the model repo.

## Routes

| Path | What it is |
|---|---|
| `/` | Overview: what the model does, the data, the validation, the results |
| `/screener` | All 131 ranked companies, filterable, CSV export |
| `/company/:ticker` | Per-company detail, score decomposition, generated thesis |
| `/methodology` | Features, training protocol, walk-forward and placebo design, limitations |
| `/research` | Long-form write-up of the signal, the data and the universe |
| `/interrogate/:ticker` | A recorded LBO interrogation replayed from the model |
| `/monitor` | Score and tier movement between runs |
| `/alerts` | Composite signal alerts |
| `/api-docs` | The read-only JSON endpoints |

Unknown paths redirect to `/`.

## Where the data comes from

Everything under `public/` is a static export of the validated run:

```
public/scores.json                  131 ranked companies + run metadata
public/score_history.json           per-ticker score history across runs
public/score_changes.json           tier movement between the last two runs
public/composite_alerts.json        composite signal alerts
public/comparable_transactions.json comparable deal set
public/theses/<TICKER>_thesis.md    131 generated theses
public/interrogation/<TICKER>.json  recorded interrogation snapshots
public/interrogation/index.json     which tickers have a snapshot
```

The `api/` serverless functions read those same files. No endpoint performs inference,
and none calls an upstream paid API — the functions exist so the JSON is addressable at
a stable URL, nothing more.

Interrogation snapshots are regenerated from the model repo with
`scripts/24_export_interrogation_snapshots.py`.

## Stack

Vite 5, React 18, react-router-dom. Inline styles, no CSS framework. Route components
are lazy-loaded. `vercel.json` rewrites all non-`/api` paths to `index.html` so deep
links resolve.

## Running it

```
npm install
npm run dev      # localhost:5173
npm run build    # -> dist/
```

## Deploying

Push to GitHub, import the repo at vercel.com, accept the auto-detected Vite settings,
deploy. No environment variables are required — there is nothing to configure, because
there is nothing to authenticate against. Vercel redeploys on every push to `main`.

To refresh the published numbers, re-run the export scripts in the model repo, copy the
resulting JSON into `public/`, and push.
