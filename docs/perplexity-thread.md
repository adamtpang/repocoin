# Perplexity research thread

Source: https://www.perplexity.ai/session/512aa5f8-8597-49a7-a72a-e0c6fe79d8f8

A cleaned markdown copy of the Perplexity session that informed the early landscape and "why hasn't this happened" discussion. Scraped 19 November 2026 from the URL above (conversation id `f7029e16-e343-43a3-917d-dedddc305d3a`). UI chrome was removed (avatars, tab labels, favicon rows, source-count badges, sign-in and cookie banners). Prompt and answer text is kept verbatim, including in-text citation markers such as `penguin+1`. Times are as they appeared on the page; the scrape recorded timezone America/New_York.

Live prior-art status was later re-checked and recorded in [landscape.md](./landscape.md). Prefer that file for current live/dead/pivoted status.

## 12:49 PM — Prompt

chris dixon read write own tokenized repos

## Answer

Are you asking about **tokenized code repositories**—open-source projects whose contributors hold tokens?

That connects to Chris Dixon’s _Read Write Own_ thesis: users and builders should be able to own part of the networks they help create, rather than just contribute to corporate-owned platforms. The book specifically covers community-created software, token incentives for software development, and network governance.penguin+1

Applied to a repo, the idea would be:

- Contributors earn tokens for building or maintaining the project.

- Tokens could confer governance or economic rights, depending on their design.

- The repository remains the codebase; the token represents separately defined ownership or participation rights—not automatically copyright in the code.

That’s an application of his framework, not a verified Dixon term or specific project from the sources found. Did you mean code repos, or financial repurchase agreements?

## 12:50 PM — Prompt

why hasnt this happened yet? like how pump.fun can easily create tokens, and you can make a github repo for free, as long as a token has a real utility inside of the repo and how it works, it could be like open source cap table for open source projects. and people can become moderators like proof of stake etc. lets brainstorm on this / find people working on this

## Answer

Yes—there’s a real product idea here. My take: **token creation is the easy part; making the token an enforceable part of how the project operates is the missing product.**

People are building pieces of this—including surprisingly literal “launch a token from a GitHub repo” tools—but that’s different from your idea of an open-source cap table with earned ownership and operational responsibilities.git-pump+1

## Who’s working on it

| Project | What they’re building | Connection to your idea |
| --- | --- | --- |
| [tea](https://tea.xyz/) | Rewards open-source projects using a dependency-impact score; supporters can stake TEA against projects. | Closest to your staking/support concept, but uses a shared ecosystem token rather than automatically creating equity-like tokens for every repo. tea+1 |
| [Drips](https://www.drips.network/) | Sends funding to GitHub repositories, splits receipts among recipients, and routes money upstream to dependencies. | Useful plumbing for the project treasury and contributor/dependency payout layer—not itself a per-repo cap table. gitcoin+1 |
| [Radworks](https://radworks.org/) | Token-governed funding and support for open-source infrastructure, including Radicle and Drips. | A working reference for a token-controlled treasury supporting software development. drips+1 |
| [GitPump](https://git-pump.github.io/) | Advertises launching tokens through a GitHub `/launch` command. | Close to the creation UX you described. Its landing page alone doesn’t establish adoption or whether tokens have meaningful project rights. [git-pump](https://git-pump.github.io/) |
| [Gitlaunch](https://rapidmolt.io/) | Advertises launching Pump.fun tokens attached to trending GitHub repositories. | Close to “repo + tradable token,” but the search result doesn’t establish maintainer authorization or actual governance integration. [rapidmolt](https://rapidmolt.io/) |
| [Gibwork](https://github.com/gibwork/gibwork-docs) | Open-source contribution workflows built around project bounties. | Adjacent infrastructure for turning work into compensation, rather than ongoing ownership. github+1 |

I’d start with tea, Drips, and Radworks for mechanism design and infrastructure conversations. Treat the launchpad examples as leads to investigate, not validated businesses.

## Why hasn’t the complete version taken off?

I wouldn’t say it hasn’t happened at all. The pieces exist. My hypothesis is that combining them creates several hard problems that a token-launch button doesn’t solve.

## 1\. What exactly does the token own?

Your “open-source cap table” framing immediately raises the most important product question:

> A cap table of the code, the treasury, future revenue, or control of the official project?

I’d define ownership around a specific operating entity or onchain treasury—not vaguely around “the repo.”

For example, a proposed project constitution could give holders:

- Voting rights over treasury spending.

- Rights to nominate and remove project stewards.

- A specified role in allocating contributor rewards.

- Explicit economic rights, if deliberately structured and legally reviewed.

Those are different rights. Bundling them into one undefined “utility token” makes the product harder to trust.

## 2\. Paying for measurable activity can produce activity instead of value

This isn’t hypothetical. Researchers studying tea-related npm activity estimated **207,101** spam packages, including **98.6%** of the packages directly registered to claim TEA rewards in their dataset. That’s a study-specific finding—not a claim about every tea project—but it’s a serious warning about rewarding manipulable contribution metrics.[ldklab](https://ldklab.github.io/assets/papers/scored25-teaspam.pdf)

For your design, I’d avoid automatic rewards for commits, PR counts, stars, or dependency counts alone. Reward accepted outcomes, with accountable reviewers and a dispute window.

## 3\. Stake doesn’t establish engineering judgment

Your proof-of-stake moderator idea is interesting, but I’d separate two questions:

- Who has money at risk?

- Who has demonstrated the competence to review this code?

My preferred design: contribution history qualifies someone for a role; a bond makes them accountable while serving in it. Buying tokens alone would not buy merge access.

Also, slashing needs a narrow definition. “Approved a bad architectural decision” is too subjective. “Claimed a bounty using someone else’s work” is much more adjudicable.

## 4\. Where does lasting demand come from?

The economic test I’d use is:

> If token trading stopped tomorrow, would customers still pay for something the project provides?

If yes, there’s potentially a business underneath the cap table. If not, the mechanism risks rewarding contributors primarily with an asset whose demand depends on attracting the next buyer.

## How I’d design it

I’d build **two ledgers**, not one token that does everything:

| Layer | Proposed purpose |
| --- | --- |
| Transferable project token | Treasury governance and whatever economic rights the project explicitly defines. |
| Nontransferable contributor reputation | Eligibility to review code, steward releases, moderate disputes, and receive responsibility. |

Then use staking as a bond for particular responsibilities—not as a universal qualification.

A possible workflow:

1. A maintainer connects a repo and proves control.

2. They publish a readable constitution: token supply, allocations, vesting, treasury rules, rights, and retained maintainer powers.

3. The platform creates the token, treasury, and public allocation ledger.

4. Contributors complete funded milestones and earn stablecoin payments, vesting tokens, or both.

5. Contributors build role-specific reputation through reviewed work.

6. Qualified contributors can become bonded reviewers or stewards.

7. Treasury spending and reward allocations become transparent and contestable.

That feels much closer to “open-source cap table” than simply attaching a coin to a README.

## What “real utility” could mean

I’d prioritize utility connected to actual project operations:

- Treasury decisions: approve budgets, grants, audits, and contributor compensation.

- Paid services: use the project’s hosted API, managed deployment, compute, or support offering.

- Bonded roles: post collateral to administer bounties or adjudicate specified disputes.

- Contributor ownership: earn a defined, vesting stake through accepted work.

- Dependency funding: automatically route part of project receipts to upstream maintainers. Drips already offers relevant funding infrastructure.gitcoin+1

I would not require holding tokens to report bugs, submit patches, or read documentation. In the proposed design, participation stays open; financial and administrative rights are the optional layer.

## The MVP I’d actually test

Not “Pump.fun for every GitHub repo.”

I’d test:

> “Connect your repo, publish a transparent ownership-and-rewards plan, and let contributors earn a stake through accepted work.”

Start with a handful of maintainer-authorized projects that already have users, recurring contributors, and some customer revenue. Keep the initial implementation narrow:

- One treasury.

- One project token.

- A public allocations-and-vesting dashboard.

- Stablecoin-funded bounties with optional token upside.

- Maintainer-approved contribution rewards.

- Reputation-gated reviewer roles.

- No automatic public token sale as the default.

My bet: the strongest wedge is not helping developers launch coins. It’s helping maintainers answer, “How do I give the people building this with me a transparent, durable stake—without negotiating a bespoke arrangement every time?”

## Related queries shown on the page

Why pump.fun-style GitHub repo tokens failed to scale — structural hurdles from SEC oversight, Sybil attacks, and speculative drift

Tea Protocol vs Gibwork vs custom repo tokens: compare on-chain contribution mechanics, staking models, and utility friction points

What breaks when a github repo launches a coin

How open source projects handle contributor vesting

What prevents smart contracts from governing code
