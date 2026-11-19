# repocoin: handoff for Claude Fable

Written 19 November 2026, about 1:20 PM CT (America/Chicago, CST, UTC-6). Revised the same day, about 1:50 PM CT, to add Balaji's sourced remarks, a deeper prior-art landscape, and name research. Revised again the same day, about 2:00 PM CT, after Adam named the product **repocoin**, claimed https://repocoin.vercel.app, and saved the full 10 November 2020 Balaji thread.

A product and engineering brief for Claude Fable. It is not a license to merge, deploy, buy a domain, register a company or GitHub App, spend money, or issue a real token. A ready-to-paste prompt is in [HANDOFF.md](../HANDOFF.md) (repo root) and at the end of this file.

**Not legal advice.** The legal notes are product constraints, not counsel. A lawyer must review the design before any real money, transferable token, or public sale.

Do not invent numbers. Source each figure or label it an assumption. Quotes in "What Balaji has said" and in [balaji-thread-2020-11-10.md](./balaji-thread.md) are only from posts and essays retrieved on 19 November 2026 (X public reads plus the linked essays). Landscape status is from live site checks and the cited primary pages that day.

## Vision

A simple way to attach a token to a GitHub repo. The token should be integral to how the project is used, contributors should earn it, and it can take on real monetary value once a market exists. Think of pump.fun's ease of launching a coin, but less degenerate: a real cap table for a repo, not a ticker stapled onto a README.

Each repo has its own token, not a shared ecosystem coin.

Contributors earn a vesting stake by shipping reviewed, accepted work, like mining, except the "block" is a merged, reviewed change, not a raw commit. People who do not code can still back a repo the way companies backed the Linux kernel: because it ran their software. They fund the project, not a patch.

The git repo stays the codebase. The token is not copyright in the code. It represents only the rights the constitution spells out (treasury say, steward nomination, specified economic rights, or none of those). Chris Dixon's *Read Write Own* is useful framing. Calling this "tokenized repos" is an application of that thesis, not a verified Dixon term. Balaji Srinivasan sketched almost this exact loop in November 2020: issue a token at zero value, award it for contributions, let companies buy it to prioritize work, and let a market form later. See the next section for his words, with links.

The hard product is not launching a coin. The 2025-2026 GitHub launchers already do that on pump.fun. The missing product is making the token an enforceable part of how the project operates. A useful test: if trading stopped tomorrow, would customers still pay for something the project provides? If not, the cap table is just a next-buyer asset.

## Name

**repocoin** is named for what it does:

1. Attach a token to a GitHub repo.
2. Make that token integral to using the repo. For example, holders get priority on issues and features, support, and roadmap votes, and possibly gated hosted features.
3. Let contributors earn the token through merged, reviewed work.
4. Let the token gain real value once a market is shown. Simpler, and less degenerate, than a pump.fun-style coin stapled onto a README.

Adam chose this name on 19 November 2026. The live prototype host is already [https://repocoin.vercel.app](https://repocoin.vercel.app) (Vercel project name exactly `repocoin`, team `adamtpangs-projects`). Do not create a second Vercel project. Do not buy or attach a custom domain.

The earlier shortlist (repocap, gitvest, mergecap) stays in the Names section as historical research. It is not a request to rename the product.

## What Balaji has said

Retrieved 19 November 2026 from @balajis (X user id `2178012643`) and from his essays. Times below are America/Chicago. Nothing here is paraphrased into his mouth; if a line is a summary, it is labeled as such.

The full 10 November 2020 thread (every retrieved post in the conversation, in order, verbatim, with links and America/Chicago timestamps), plus a Related section with *Thoughts on Tokens*, the cap table tweet, the coin table tweet, and the mirrortable essay, is saved at [balaji-thread-2020-11-10.md](./balaji-thread.md). The conversation has 183 retrieved posts. Balaji wrote 7 of them, all on 10 November 2020. He posted no later replies in this conversation (checked through 19 November 2026).

A short subset is quoted below. Prefer the thread file when you need the complete text.

The closest match to this product is a thread from 10 November 2020, starting 5:58 PM CT:

> A new way to fund open source?
>
> - Be open source dev
> - Issue a token
> - Hold X% of it
> - Has 0 value initially
> - Award (100-X)% of it over time to folks who contribute code
> - Companies then buy token to prioritize bugs & features
> - Suddenly, an economy arises!

https://x.com/balajis/status/1326313315044192256 (10 Nov 2020, 5:58 PM CT)

> The basic idea is that the token starts as zero value. There's no ICO, it's just a way for the lead dev to say thank you for people submitting pull requests.
>
> Over time, it organically gains utility, as it becomes a way to pay for the time of people with skill in that codebase.

https://x.com/balajis/status/1326313316961013760 (10 Nov 2020, 5:58 PM CT)

> The value of the token is essentially a bet on how big the open source project will get. If you believe that a project may attain thousands of stars and forks, you buy the token as a way of supporting the devs *and* capturing upside.

https://x.com/balajis/status/1326314262155862016 (10 Nov 2020, 6:02 PM CT)

Later in the same thread he said GitHub or GitLab could eventually offer this as a one-click feature: "You'd want to start with individual experiments, but eventually GitHub/GitLab could offer one-click ways to do this." https://x.com/balajis/status/1326316360729653253 (10 Nov 2020, 6:10 PM CT)

On tokens versus equity, from *Thoughts on Tokens* (27 May 2017, [news.earn.com](https://news.earn.com/thoughts-on-tokens-436109aabcbe)):

> The most important takehome is that tokens are not equity, but are more similar to paid API keys. Nevertheless, they may represent a >1000X improvement in the time-to-liquidity and a >100X improvement in the size of the buyer base relative to traditional means for US technology financing — like a Kickstarter on steroids. This in turn opens up the space for funding new kinds of projects previously off-limits to venture capital, including open source protocols and projects with fast 2X return potential.

And, in the same essay, a warning that still applies:

> Don't issue tokenized equity unless you want to be limited to accredited investors under US securities laws. The critical distinction is whether the token is simply a useful and tradable digital item like a paid API key. Again: read these three posts and consult a good lawyer before embarking on a token launch!

On cap tables, 15 February 2019, 4:12 AM CT: "I'd argue this force is crypto. Thesis: the most important data structure in Silicon Valley is the cap table. And crypto scales the concept of a cap table. It's now possible to economically align hundreds of thousands or millions of people behind an idea." https://x.com/balajis/status/1096351597028769794

Supporting remarks, shorter:

- 21 August 2021, 2:21 AM CT: in crypto, "You may now have both a coin table and a cap table," multiple "coin liquidations" rather than one M&A exit, and "You are often investing in things that aren't companies at all." https://x.com/balajis/status/1428980480980914177
- 26 December 2021 essay [*The Mirrortable*](https://balajis.com/p/mirrortable), announced 27 December 2021, 6:08 AM CT: "A mirrortable is to a cap table what a stablecoin is to a fiat currency." That design is an on-chain mirror of a legally compliant off-chain cap table (for example Carta), not a substitute for it. https://x.com/balajis/status/1475438356473409542
- 27 September 2020, 1:16 AM CT, on open-source business models: "Community (v3): open source all code, and issue a token or charge for access to the community." https://x.com/balajis/status/1310101055816921090
- 21 March 2022, 2:54 AM CT: "Open source everything but the token." https://x.com/balajis/status/1505815195616423941
- 28 July 2025, [*All Property Becomes Cryptography*](https://balajis.com/p/all-property-becomes-cryptography): "the full legalization of stablecoins means that every other asset goes onchain." He adds that a legal status for onchain currency implies "a legal path for onchain stocks, onchain bonds."
- *The Network State* (free at [thenetworkstate.com](https://thenetworkstate.com/)) is adjacent, not a repo-token design. The retrieved passage is about crowdfunding a community's physical footprint: "the community crowdfunds physical properties around the world and connects them via the internet." Do not treat that as a spec for GitHub tokens.

What this means for the product: Balaji's 2020 loop is the one to build toward (start at zero, no ICO, earn by accepted work, companies buy to prioritize, a market may form). His 2017 essay is the legal caution: useful, tradable access is a different thing from tokenized equity, and a lawyer has to draw that line before real money.

## Earning rules and anti-farming

Only merged, reviewed, accepted work earns. Nothing is credited for opens, commit counts, stars, lines changed, or dependency graphs alone.

That is not hypothetical. Researchers studying tea-related npm activity estimated **207,101** spam packages, including **98.6%** of the packages directly registered to claim TEA rewards in their dataset. Study-specific, not a claim about every tea project. Paper: https://ldklab.github.io/assets/papers/scored25-teaspam.pdf

Prototype rules (parameters are assumptions until Adam sets them, and must be labeled as such in the UI):

- A credit is created only when a PR is merged into the default branch and has at least one approving review from a qualified reviewer who is not the author.
- Credits vest. Starting assumption: 12-month vest, 1-month cliff, monthly thereafter. Unvested credits return to the treasury if the contributor is removed for a constitutionally defined cause.
- Reviewers are bonded. A narrow slashable offense, example only: claiming credit for someone else's work. "Approved a decision I later dislike" is not slashable.
- A dispute window (assumption: 7 days after merge) before vesting starts.
- Sybil basics: one GitHub account per contributor in the MVP; the maintainer can void farmed PRs; no self-approvals.

## Two ledgers

Do not ship one token that tries to be money, resume, and merge bit.

| Ledger | Purpose | Transferable? |
| --- | --- | --- |
| Project token (prototype: points or testnet only) | Treasury governance and whatever economic rights the constitution explicitly defines. | Eventually yes. Not in the prototype. |
| Contributor reputation | Eligibility to review, steward releases, moderate disputes, and hold bonded roles. | No. Ever. |

Staking is a bond for a particular role (reviewer, steward), not a way to buy merge access. Contribution history qualifies someone; the bond makes them accountable while they serve. Buying the token alone does not buy write access.

The constitution, published when a repo is connected, must state in plain language: supply and allocations, vest, treasury rules, rights, retained maintainer powers, and what the token is not.

## Buy-side demand

Investor demand has to come from companies that depend on the repo, not from the next trader. Design for, and in the prototype only *display*, these utilities. Do not charge real money:

- Priority fixes and support for paying dependents.
- Roadmap say, as the constitution defines it, not informal influence.
- Buybacks or treasury inflows funded by hosted revenue (managed hosting, support retainers, or a paid API), if and when a project has any.

Do not require a token to report a bug, open a PR, or read the docs. Participation stays open. Financial and administrative rights are the optional layer.

## Global from day one

Going global on day one helps distribution. It does not get the project out of US law. If Americans can buy, US securities rules (including Howey analysis) can still apply. The EU's MiCA regime can apply to EU users.

A common intended end-state, for later legal review, not for Fable to implement: a foundation outside the US, US persons geo-blocked from buying the transferable token, and a clean split between that token and nontransferable reputation.

**This is not legal advice.** Retain a lawyer before any real money, transferable token, public sale, or geo-block that is meant to be a real control. Fable must not form an entity, write offering docs, or collect funds.

**Prototype rule:** points or a public testnet only. No mainnet token, no payments, no "invest" button that moves value, no implied return.

## Landscape

Checked 19 November 2026, about 1:35 to 1:45 PM CT, unless a cited page is dated otherwise. "Live" means the official site loaded and still describes the product. "Dead" means the operator shut it down, or the site is gone. "Pivoted" means the company is live but no longer selling the original thing. "Not serving" means the hostname did not return a product page when checked.

The important split: funding rails and bounties pay people, but they are not a per-repo cap table. The 2025-2026 GitHub launchers (flagged below) attach a pump.fun-style coin to a repo, but the coin is usually not integral to using the repo. gitcap's own docs say the token "gives you no rights over the code" and "the owners are not affiliated with its market, get no fees and have not endorsed it." This design is the opposite: a maintainer-connected token that contributors earn, and that is part of how the project runs.

### Closest live competitors (flagged)

| Project | Status | Link | What it does |
| --- | --- | --- | --- |
| tea | Live | https://tea.xyz/ | Shared TEA token. Supporters stake TEA; projects are ranked by a "Proof of Contribution" score. Not a per-repo cap table. See the spam study above. |
| Drips | Live | https://www.drips.network/ | Streams funds to GitHub repos, splits, upstream routing, and "Waves" that turn merged PRs into on-chain rewards. Payout rail, not a tradable per-repo cap table. |
| Radworks / Radicle | Live | https://radworks.org/, https://radicle.xyz/ | Radworks describes itself as "a secure, peer-to-peer foundation for open source." Radicle is a peer-to-peer Git collaboration stack ("the sovereign forge"). Drips sits in the same family. Infrastructure and funding, not a one-click repo coin. |
| GitPump (gitpump.live) | Live | https://gitpump.live/ | Curated board of trending GitHub repos launched on pump.fun. Creator fees lock 100% to the repo owner's GitHub vault. A coin on the repo, not governance or earned ownership. |
| GitPump (git-pump.github.io) | Live site | https://git-pump.github.io/ | A separate GitHub-bot launch UX ("Launch on GitHub") targeting pump.fun, Bags.fm, Clanker, and Four.meme. Same category: launch, not an integral repo token. |
| Gitlaunch | Live | https://rapidmolt.io/ | "Launch" on a trending GitHub repo deploys a pump.fun token. The homepage still showed "No repo launched yet" when checked. |
| gitcap | Live | https://gitcap.fun/ | Anyone can list any public repo as a Solana / pump.fun market, keyed to the GitHub repo id. One market per repo. Owners get no fees and no rights over the code. The site showed 3 markets and a $6,111 headline cap at check time (operator dashboard, not independently verified). |
| GitPad | Live | https://gitpad.cc/ | Paste a repo, launch on pump.fun. A repo admin can later claim: the page says 90% of creator fees go to the owner and 10% buy-and-burn $GITPAD. Closer on fee-sharing, still not an earned cap table. |
| Gibwork | Live | https://www.gib.work/ (docs: https://github.com/gibwork/gibwork-docs) | On-chain work marketplace and bounties. One-off pay for tasks, not ongoing vesting ownership. (gibwork.com is an unrelated Gibraltar jobs site.) |

### Funding rails and public-goods programs (live, not cap tables)

| Project | Status | Link | What it does |
| --- | --- | --- | --- |
| Gitcoin | Live | https://gitcoin.co/ | Grants and funding for public goods ("Fund What Matters"). Shared ecosystem, not a token per repo. |
| Open Collective | Live | https://opencollective.com/ | Transparent raise, manage, and disburse money for projects and collectives. Fiat fiscal hosting, not a token. |
| Juicebox | Live | https://juicebox.money/ | On-chain treasuries to "fund your thing." Project treasuries and tokens, not a GitHub-native earned cap table. |
| thanks.dev | Live | https://thanks.dev/ | Scans dependency trees and routes funding to maintainers who register. |
| Protocol Guild | Live | https://www.protocolguild.org/ | Collects funding and splits it among Ethereum core developers ("Securing the future of Ethereum core development"). One guild, not a tool for any repo. |
| Optimism Retro Funding | Live program, messy URLs | https://gov.optimism.io/ | The Optimism Collective's retroactive public goods funding (historically RetroPGF). The Collective governance hub loaded. Older `/retropgf` paths 404'd or redirected when checked, so confirm the current application URL before linking it in a UI. |
| Liberapay | Live | https://liberapay.com/ | Recurring donations. A fork of Gratipay. |
| IssueHunt | Live, narrowed | https://issuehunt.io/ | Still up; the homepage now presents itself as a bug-bounty platform in Japan, not a general GitHub issue market. |
| Polar | Pivoted, live company | https://polar.sh/ | Now "a billing platform for the intelligence era" (Merchant of Record for AI-era software). GitHub issue funding was removed from the codebase in 2025 (Polar issue "Issue Funding: Remove from codebase after April 2nd," closed as completed 30 Apr 2025, per a 15 Oct 2026 write-up at https://commonworld.one/atlas/platforms/polar-issue-funding/). |

### General token launchers (live, not repo-native)

| Project | Status | Link | What it does |
| --- | --- | --- | --- |
| pump.fun | Live | https://pump.fun/ | Solana token launchpad with a bonding curve, then a PumpSwap pool. The 2025-2026 repo launchers run on these rails. A direct GET was Cloudflare-blocked (HTTP 403); the product is described as live on GitPump and gitcap's own docs. |
| Clanker | Live | https://www.clanker.world/ | No-code ERC-20 launches on Base and other chains. The site claims "Over 1.5M tokens launched" (operator figure, not independently counted here). |
| Bankr | Live | https://bankr.bot/ | AI agent that can buy, sell, and swap coins and place limit orders. A launcher-adjacent agent, not a repo cap table. |

### Dead, wound down, or not serving

| Project | Status | Link | What it did |
| --- | --- | --- | --- |
| Gittip / Gratipay | Dead | https://gratipay.com/, shutdown post: https://gratipay.news/the-end-of-gratipay-cbfba8f50981 | Chad Whitacre launched Gittip in 2012 as a "tip jar for GitHub," later renamed Gratipay, and shut it down at the end of 2017. The memorial site is still up. Liberapay is the live fork. gittip.com did not complete TLS when checked. |
| Bountysource | Dead | https://en.wikipedia.org/wiki/Bountysource | GitHub-integrated OSS bounties and crowdfunding. Wikipedia (page dated 22 Sep 2026): stopped paying as of June 2023; the parent announced bankruptcy in November 2023; the site said "temporarily down" as of May 2024. The hostname failed TLS when checked on 19 Nov 2026. |
| SourceCred | Org wound down; docs still up | https://sourcecred.io/, announcement: https://discourse.sourcecred.io/t/sourcecred-the-organization-is-winding-down/1383 | Graph-based "Cred" for measuring and rewarding value creation. The organization announced it was winding down on 28 Mar 2022. The docs site still loads. |
| Coordinape | App sunset | https://coordinape.com/ | Peer-to-peer "GIVE" allocation inside DAOs, 2021-2025. The live site is now a memorial: "The app is now sunset. This page is its monument." |
| gitfees.xyz | Not serving | https://gitfees.xyz/ | Returned `Application not found` (HTTP 404) when checked. Do not treat it as a live product. |
| gitfund.live | Not serving | https://gitfund.live/ | Apex failed TLS; www returned Vercel `DEPLOYMENT_NOT_FOUND`. |
| RepoX | Not serving | https://repox.fun/ | HTTP 402 `DEPLOYMENT_DISABLED` when checked. Earlier write-ups described a pump.fun discovery UI for trending GitHub repos, with a maintainer takedown path. |

## Names

**Settled.** Adam picked **repocoin**. The prototype is live at https://repocoin.vercel.app (HTTP 200 as of 19 November 2026, about 1:50 PM CT). Do not buy a domain, attach DNS, or rename the Vercel project. Historical research from earlier the same day is kept below so the shortlist is not lost.

`repocoin.com` was taken. `repocoin.fun` listed at $1.99 year one / $27 renew. `repocoin.xyz` was taken. `repocoin.dev` listed at $13. `repocoin.so` was taken. Those prices were a read-only Vercel `search_domains` lookup, 19 November 2026, about 1:40 PM CT. Nothing was reserved or purchased.

The job of the name is to say "attach a token to a repo" in a short, serious way. Avoid moon/pump/degen flavor. gitcoin is already taken by Gitcoin (every TLD checked below was unavailable).

About 15 candidates: repocap, gitvest, mergecap, stakerepo, gitstake, kernelcap, gitown, mergetoken, gitmint, mintrepo, repomint, gittoken, gitshare, forktoken, commitcap, plus the obvious also-rans repocoin, commitcoin, and gitstock.

Availability and 1-year USD list prices are from the Vercel `search_domains` registrar lookup, 19 November 2026, about 1:40 PM CT. This was read-only. Nothing was reserved or purchased. First-year `.fun` prices are $1.99 and renew at $27. `.dev` is $13 to register and renew. `.xyz` when available is $1.49 to register and $13 to renew. `stakerepo.com` is $12.03 to register and renew. `*.vercel.app` was checked by a GET; "free" means the host returned `404 DEPLOYMENT_NOT_FOUND`.

The eight strongest, with those checks:

| Name | Why it fits | .com | .fun | .xyz | .dev | .so | vercel.app |
| --- | --- | --- | --- | --- | --- | --- | --- |
| repocap | Repo + cap table. Tightest description of the product. | taken | $1.99 | taken | $13 | taken | free |
| gitvest | Vesting is in the earning rules. Serious, not degen. | taken | $1.99 | $1.49 | $13 | taken | free |
| mergecap | You earn the cap table by merging. | taken | $1.99 | $1.49 | $13 | taken | free |
| stakerepo | A stake in a repo. Only open `.com` on this list. "Stake" can also sound like tea-style staking. | **$12.03** | $1.99 | $1.49 | $13 | taken | free |
| gitstake | Same idea, git-first. | taken | $1.99 | taken | $13 | taken | free |
| kernelcap | The Linux-kernel backer metaphor. More poetic, less obvious. | taken | $1.99 | taken | $13 | taken | free |
| gitown | Ownership of a git project. Broad, a bit vague. | taken | $1.99 | $1.49 | $13 | taken | free |
| mergetoken | Very literal. A little long. | taken | $1.99 | taken | $13 | taken | free |

Do not use these as a `*.vercel.app` prototype host; they already serve something: `gitmint.vercel.app` (Create Next App), `mintrepo.vercel.app` (Mintbase example), `gittoken.vercel.app` (title "GitToken"), `gitshare.vercel.app` (200), `commitcoin.vercel.app` (Anima placeholder).

**Top 3**

1. **repocap.** It is the plainest name for "a cap table on a repo." `repocap.vercel.app` is free and is the default prototype host in this brief. A custom domain would likely be `repocap.dev` at $13/year, because `.com` and `.xyz` are taken. `.fun` is cheap in year one and a weaker fit for a serious product.
2. **gitvest.** It says the thing contributors actually get: a vesting stake. `gitvest.xyz` is available at $1.49, `gitvest.dev` at $13, and `gitvest.vercel.app` is free. Slightly less obvious than repocap, and more serious than anything with "coin" or "mint."
3. **mergecap.** It encodes the earning rule in the name: the cap table is what you earn by merging. `mergecap.xyz` is $1.49, `mergecap.dev` is $13, and `mergecap.vercel.app` is free. If Adam would rather have a `.com` than a perfect metaphor, **stakerepo.com** is the practical alternative at $12.03; just know "stake" may be read as tea-style staking rather than earned ownership.

Do not buy a domain, attach DNS, or deploy to one of these names without Adam's yes.

## MVP, stack, and test bed

**User story:** a maintainer connects a repo, publishes a constitution, and contributors earn a vesting stake (points) when reviewed PRs merge. Anyone can see the public ledger.

1. A GitHub App (Adam registers it; Fable does not create the App or any paid account) proves the installer is a repo admin, then receives `pull_request` events.
2. Constitution editor and public constitution page (markdown, required sections above).
3. Credit pipeline: merged + approved PRs only, vest clock, dispute window, maintainer void.
4. Dashboard: allocations, unvested vs vested points, reputation, bonded roles, recent credited PRs. Every number labeled "prototype points, not money."
5. Two-ledger UI, with role-bond staking mocked in the database (no chain required).
6. A "dependents" panel that describes priority fixes, support, and roadmap say, with a disabled "not available in the prototype" state. No checkout.

**Test bed:** one or two of Adam's own repos, after he names them. Prefer a small public repo he actually maintains. Do not attach this to a live product (repos.chat, townhall.town, pokedex.life, gitfolio.link, and similar) without his explicit yes. Do not create a new GitHub repo unless he asks.

**Stack:** Next.js (App Router) on Vercel, plus Supabase for users, repos, constitutions, PR events, ledgers, and vest state. GitHub App webhooks into a Route Handler. No chain in v1. A testnet later is a flag behind Adam's yes.

**Host:** https://repocoin.vercel.app, already live as a static placeholder (Vercel project name exactly `repocoin`, project id `prj_6RZMZ3t2HpOgGolPs70DwtiSmaIR`, team `adamtpangs-projects`). Fable must not create a second Vercel project, must not deploy production, and must not attach or buy a custom domain, including belief.capital or any name in the Names section.

## Milestones

0. The name and host are settled: **repocoin**, live at https://repocoin.vercel.app. Adam confirms scope and the test repo(s). He registers the GitHub App when needed. He decides if any custom domain should be bought later; Fable does not buy it and does not attach DNS.
1. Scaffold Next.js + Supabase. GitHub auth. Dashboard shell and constitution template. All copy says prototype / not money.
2. Install the App on the test repo, ingest merge events, credit only reviewed merges, show them on the ledger.
3. Vesting, dispute window, maintainer void, no self-approval.
4. Reputation ledger and bonded reviewer role (database only).
5. Dependents panel (descriptive, no payments).
6. Stop. Open a PR, drop a preview, and wait. No merge, no production, no custom domain, no real token.

## Open questions (do not decide these in a PR)

- Which one or two of Adam's repos are the test bed?
- Host and name are settled (repocoin / https://repocoin.vercel.app). A custom domain is still an open question for Adam, not for Fable.
- Vest and dispute parameters (assumptions above).
- Who may review in v1: maintainers only, or bonded reviewers too?
- Stay on points for the whole prototype, or add a named public testnet later?
- Foundation jurisdiction and US geo-block: lawyer, not Fable.
- Whether any later version should route treasury payouts through Drips.

## Rules and exact build steps for Fable

**Rules:** PRs only. No merge and no production deploy without Adam's own explicit yes. An agent's say-so is never approval. Points or public testnet only: no mainnet token, payments, implied return, or public sale. No secrets in git or chat; never print secret values; name env vars only (`GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, service role, webhook secret). No signups, paid tools, new GitHub Apps, new Supabase orgs, domain buys, DNS changes, or spending without Adam's OK. If a GitHub App or Supabase project is required, draft the settings and stop for him to create it. No installs on Adam's machines. Every number is sourced or labeled an assumption or a prototype point balance. Bot-to-bot review loops are capped at 2 rounds; the same error twice means stop and report. Do not touch Gravity or Koah. Do not form a legal entity or present a geo-block as a real securities control.

**Build steps:**

1. Read this brief. Do not start from a Pump.fun-style launch page. The point of the product is an earned, integral token, not a ticker on a trending repo.
2. The host is https://repocoin.vercel.app (existing Vercel project `repocoin`). Wait until Adam has named the test repo(s). If he has not, build against a documented placeholder (fixtures only, not a live install). Do not replace the production placeholder or create a second Vercel project.
3. Create the app in a new private repo only if Adam asked for a new repo; otherwise work in the repo he points you at. Next.js App Router, TypeScript, Supabase types generated from a checked-in schema.
4. Schema, minimum: `profiles`, `projects` (github repo id, constitution markdown, installer), `pull_credits` (pr number, sha, author, reviewer, merged_at, status, points, vest dates), `ledger_entries` (token-points vs reputation), `role_bonds`, `audit_log`. Migrations in git. No seed figures that look like real market caps.
5. Implement GitHub App webhook verification and a handler for `pull_request` closed/merged. Credit only if merged, approved by a non-author, and the project is connected. Idempotent on delivery id and on `(project, pr number, sha)`.
6. Constitution page at `/[owner]/[repo]`, dashboard at `/[owner]/[repo]/ledger`. Label every balance "Prototype points. Not money. Not a token you can sell."
7. Tests for: unreviewed merge is not credited; self-approval is not credited; duplicate webhook does not double-credit; vest is zero before the cliff; maintainer void stops vesting. Run lint, typecheck, unit tests, and production build.
8. Open a PR with a preview. Hand Adam the PR link, the test count, and what he still has to do (GitHub App registration, Supabase project, env vars). Do not merge. Do not deploy production. Do not attach or buy a domain.

## Prompt for Claude Fable

The ready-to-paste version, with repo paths, lives in [HANDOFF.md](../HANDOFF.md). Summary:

Build a proof-of-concept for **repocoin** from `docs/spec.md` and `docs/balaji-thread.md`. The product attaches a token to a GitHub repo, makes that token integral to using the repo (priority issues and features, support, roadmap votes, and possibly gated hosted features), lets contributors earn it through merged, reviewed work, and lets it gain real value once a market is shown. Simpler and less degenerate than a pump.fun clone. Balaji's 10 November 2020 thread is the loop to aim at (full text in `docs/balaji-thread.md`; starts at https://x.com/balajis/status/1326313315044192256). Two ledgers: prototype points standing in for a future transferable token, plus nontransferable reputation. Staking is a bond for reviewer or steward roles, not a path to buy merge access. Reward only accepted work; the tea spam study estimated 207,101 spam npm packages (https://ldklab.github.io/assets/papers/scored25-teaspam.pdf). Stack is Next.js on Vercel plus Supabase, plus a GitHub App that Adam will register. Live placeholder: https://repocoin.vercel.app (Vercel project name exactly `repocoin`; do not create a second project). Points or testnet only. No real money, no mainnet token, no payments, no domain purchase, no custom domain, no merge, no production deploy, no secrets in git, no signups or spending, no new legal entity. PRs only, then stop and report.
