# repocoin

Attach a token to any GitHub repo. Coming soon.

**repocoin** is a simple way to:

- Attach a token to a GitHub repo.
- Make that token integral to using the repo. Holders can get priority on issues and features, support, and roadmap votes, and possibly gated hosted features.
- Let contributors earn the token through merged, reviewed work.
- Let the token gain real value once a market is shown. Simpler, and less degenerate, than a pump.fun-style coin stapled onto a README.

Live placeholder: [https://repocoin.vercel.app](https://repocoin.vercel.app)

The product is a prototype only: points or a public testnet, not a live token, not money, and not an offering.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000/repocoin-demo/sample-repo for the fixture demo (fake people and PRs run through the real credit pipeline). Live repos need Supabase and the GitHub App; see [docs/setup.md](docs/setup.md) and `.env.example`.

Checks: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

Built from the official Next.js template (`create-next-app`, Next.js 16, App Router, TypeScript, Tailwind): https://github.com/vercel/next.js/tree/canary/packages/create-next-app

## Layout

- `src/lib/credit.ts`: who earns. Merged into the default branch, approved by a qualified non-author, human author, connected repo.
- `src/lib/vesting.ts`: dispute window, cliff, monthly vest, void freezes vesting.
- `src/lib/webhook.ts`: GitHub App events. Idempotent on delivery id and on (project, PR number, merge sha).
- `src/app/api/github/webhook/route.ts`: signature check, then the pipeline.
- `src/app/[owner]/[repo]`: constitution page. `.../ledger`: public two-ledger view, bonds, credited PRs, audit log, dependents panel.
- `supabase/migrations`: schema, row level security, and the atomic `credit_merge` and `void_credit` functions.

## Docs

Read everything in `docs/` before writing code.

- [docs/context.md](docs/context.md) — Adam's idea in his own words, plus the decision log
- [docs/spec.md](docs/spec.md) — product and engineering brief for the Claude Fable build
- [docs/balaji-thread.md](docs/balaji-thread.md) — Balaji Srinivasan's 10 November 2020 open-source token thread, full conversation, verbatim, plus related quotes
- [docs/perplexity-thread.md](docs/perplexity-thread.md) — cleaned Perplexity research thread that informed the early landscape
- [docs/landscape.md](docs/landscape.md) — prior-art findings (live, dead, and pivoted), with links and check dates
- [docs/names.md](docs/names.md) — name research and domain list prices (name is settled: repocoin)
- [docs/setup.md](docs/setup.md): what Adam still has to do: Supabase, GitHub App settings draft, env vars
- [HANDOFF.md](HANDOFF.md) — exact build steps, rules, and a ready-to-paste prompt for Fable

## Rules

- PRs only. Do not merge, and do not deploy production, without Adam's own explicit yes.
- No real-money token. Points or a public testnet only.
- No secrets in git.

## License

[MIT](LICENSE). Copyright (c) 2026 Adam Pangelinan.
