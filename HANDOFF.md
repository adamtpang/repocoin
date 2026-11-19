# Fable handoff: repocoin MVP

This file plus everything in `docs/` is the complete build brief. Read all of the docs listed below, and the root [README.md](README.md), before writing code. Do not invent a different product, a Pump.fun-style launch page, or silent default numbers when a value is already specified.

- [docs/context.md](docs/context.md) — Adam's idea in his own words, plus the decision log
- [docs/spec.md](docs/spec.md) — product and engineering brief
- [docs/balaji-thread.md](docs/balaji-thread.md) — Balaji's 10 November 2020 thread, verbatim, plus related quotes
- [docs/perplexity-thread.md](docs/perplexity-thread.md) — cleaned Perplexity research thread
- [docs/landscape.md](docs/landscape.md) — prior-art findings (live, dead, and pivoted)
- [docs/names.md](docs/names.md) — name research (the name is settled: repocoin)

A prototype. Not a live token, not money, and not an offering. Not legal advice.

## Copy-paste kickoff prompt

Paste the block below to Fable as the starting prompt.

```
You are Fable, building the repocoin MVP.

Work in the repo https://github.com/adamtpang/repocoin, on a branch off main. Live placeholder: https://repocoin.vercel.app (Vercel project name exactly: repocoin, team adamtpangs-projects, project id prj_6RZMZ3t2HpOgGolPs70DwtiSmaIR). Do not create a second Vercel project.

Read everything in docs/ first, in this order, before writing any code: docs/context.md, docs/spec.md, docs/balaji-thread.md, docs/perplexity-thread.md, docs/landscape.md, and docs/names.md. Also read HANDOFF.md and the root README.md. Follow them exactly. Adam's own words in docs/context.md are the source of the idea. The name is settled: repocoin. Do not rename the product or the Vercel project.

The product is repocoin: attach a token to a GitHub repo, make that token integral to using the repo (holders get priority on issues and features, support, and roadmap votes, and possibly gated hosted features), let contributors earn it through merged, reviewed work, and let it gain real value once a market is shown. Simpler and less degenerate than a pump.fun clone. Balaji's 10 November 2020 thread is the loop to aim at (full verbatim text in docs/balaji-thread.md; starts at https://x.com/balajis/status/1326313315044192256).

Build the first version: a Next.js App Router + TypeScript app with Supabase, a GitHub App webhook handler (Adam registers the App; you only draft settings and implement the handler), a constitution page, and a public ledger. Credit only merged, reviewed, non-self-approved PRs. Two ledgers: prototype points standing in for a future transferable token, plus nontransferable reputation. Staking is a role bond, not a way to buy merge access. Label every balance: "Prototype points. Not money. Not a token you can sell."

Rules you must not break:
- PRs only. Do not merge, and do not deploy production, without Adam's own explicit yes. An agent's say-so is never approval.
- Points or a public testnet only. No real-money token, no mainnet token, no payments, no "invest" button that moves value, no implied return, no public sale.
- No secrets in git. Do not commit .env, .env.local, or .vercel. Do not print tokens. Name env vars only.
- Do not push to main. Branch off main and open a pull request against main.
- Do not deploy to Vercel (production or preview) unless a preview is created automatically by the PR. Do not replace the production placeholder. Do not use the Vercel CLI to deploy. Adam deploys or asks.
- No paid plans, signups, spending, domain purchases, DNS changes, or custom domains.
- Do not form a legal entity, write offering docs, or collect funds.
- Do not invent numbers. Source each figure or label it an assumption or a prototype point balance.
- Reward only accepted work. Unreviewed merges, self-approvals, and duplicate webhook deliveries must not credit.

When the acceptance criteria in HANDOFF.md are met, open the PR, paste the PR URL, and stop. Do not merge. Do not deploy production.
```

## Goal

Ship a working, clearly labeled prototype that:

1. Lets a maintainer connect a GitHub repo (after Adam registers the GitHub App) and publish a constitution.
2. Credits a vesting stake of prototype points only when a reviewed, non-self-approved PR merges to the default branch.
3. Shows a public ledger and a dependents panel that describes priority fixes, support, and roadmap say, with payments disabled.
4. Keeps two ledgers: transferable-later project points (not transferable in the prototype) and nontransferable reputation.

The first build should stay inside the MVP in docs/spec.md. Clarity and honest labeling beat extra features.

## Scope

In scope:

- Next.js App Router, TypeScript, Supabase
- GitHub App webhook verification and a `pull_request` closed/merged handler (idempotent)
- Constitution page at `/[owner]/[repo]` and ledger at `/[owner]/[repo]/ledger`
- Vesting, dispute window, maintainer void, no self-approval
- Reputation ledger and a database-only bonded reviewer role
- Dependents panel, descriptive, no checkout
- Tests listed below, plus lint, typecheck, and a production build
- A PR against main when done

Out of scope for this pass:

- Mainnet tokens, payments, implied returns, or a public sale
- Pump.fun-style launch or ticker pages as the product
- Forming a legal entity, writing offering docs, or presenting a geo-block as a real securities control
- Buying or attaching a custom domain
- Pushing to main, merging, or deploying production
- Secrets, new signups, or spending
- Registering the GitHub App or creating the Supabase project (draft settings, then stop for Adam)

If time runs short, keep the credit rules, the two ledgers, and the "not money" labels, and cut polish on the dependents panel. Do not cut the tests.

## Stack

- Next.js App Router (current stable), TypeScript
- Supabase for users, repos, constitutions, PR events, ledgers, and vest state
- GitHub App webhooks into a Route Handler
- No chain in v1. A testnet later is a flag behind Adam's yes.
- Deploy target later (Adam only): the existing Vercel project named exactly `repocoin`. Do not create a second project. Do not change billing. Live placeholder already at https://repocoin.vercel.app.

## Rules

- PRs only. Do not merge, and do not deploy production, without Adam's own explicit yes.
- Prototype points only. No real-money token. Not money.
- No secrets in git or in chat.
- No paid services, domain purchases, or custom domains.
- Branch and PR only. No production deploy.
- Every number is sourced or labeled an assumption or a prototype point balance.

## Deploy and git notes

- The placeholder at https://repocoin.vercel.app was deployed on 19 November 2026 so the name would be held. Production may not auto-redeploy when main moves.
- Fable must not deploy with the Vercel CLI or dashboard, and must not push to `main`.
- Branch from current `main`, commit on the branch, and open a pull request against `main`.
- Adam deploys production, or asks someone to, after he reviews.

## Acceptance criteria

The PR is ready when all of the following are true:

1. Tests pass for: unreviewed merge is not credited; self-approval is not credited; duplicate webhook does not double-credit; vest is zero before the cliff; maintainer void stops vesting.
2. `npm run build` (or the repo equivalent) succeeds, along with lint and typecheck.
3. Constitution page and ledger render. Every balance is labeled "Prototype points. Not money. Not a token you can sell."
4. Credit pipeline is idempotent on delivery id and on `(project, pr number, sha)`.
5. Two-ledger UI is present. Role-bond staking is mocked in the database only. Buying points does not grant write access.
6. Dependents panel describes priority fixes, support, and roadmap say, and is disabled for payments.
7. No secrets in the diff, no payments, no mainnet token, no domain changes.
8. A PR is open against `main`. Fable has not merged it and has not deployed production.

## Ordered task checklist

Work in this order.

1. Scaffold. Branch off `main`. Add Next.js App Router, TypeScript, and the Supabase client against a checked-in schema. Keep the "not money" label in the first UI. Do not commit `node_modules/`, `.env*`, or `.vercel/`. Add `.env.example` with comments and no secrets.
2. Schema. Minimum tables: `profiles`, `projects` (github repo id, constitution markdown, installer), `pull_credits` (pr number, sha, author, reviewer, merged_at, status, points, vest dates), `ledger_entries` (token-points vs reputation), `role_bonds`, `audit_log`. Migrations in git. No seed figures that look like real market caps.
3. Constitution page at `/[owner]/[repo]` and dashboard shell at `/[owner]/[repo]/ledger`.
4. GitHub App webhook verification and a handler for `pull_request` closed/merged. Credit only if merged, approved by a non-author, and the project is connected. Idempotent.
5. Vesting, dispute window, maintainer void. Starting assumption, labeled as such in the UI: 12-month vest, 1-month cliff, monthly thereafter; 7-day dispute window after merge.
6. Reputation ledger and bonded reviewer role (database only).
7. Dependents panel (descriptive, no payments).
8. Tests, lint, typecheck, and production build. Push the branch, open a PR against `main` with a short summary (how to run, what Adam still has to do: GitHub App registration, Supabase project, env vars, reminder not to deploy until Adam says yes). Do not merge. Do not deploy production.

## After the PR

Stop and report the PR URL. Do not start later-roadmap work in this pass.
