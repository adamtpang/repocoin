# Prior art landscape

This is the full prior-art section from the 19 November 2026 brief, kept as its own file so it can be updated without rewriting the spec. Related early research is in [perplexity-thread.md](./perplexity-thread.md).

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

