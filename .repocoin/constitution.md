# adamtpang/repocoin constitution

**Ticker:** $REPO (proposed, not final)

**Prototype points. Not money. Not a token you can sell.** repocoin runs on repocoin: this repo earns its own points the same way any connected repo does. There is no live token, no market, and no offering yet. Not legal advice.

## Supply and allocations

- Supply is not fixed in the prototype. Each credited merge mints **100 prototype $REPO points** to its author. (Assumption, not a decision.)
- Maintainer allocation: not set. In Balaji's 2020 sketch the lead dev holds X% and awards the rest to contributors over time. Adam has not chosen X.
- Points cannot be bought, sold, or transferred in the prototype.

## How to earn $REPO

1. Pick an open issue on this repo, or open one describing what you want to fix.
2. Open a pull request against `main`.
3. Get an approving review from a maintainer or a bonded reviewer who is not you.
4. When it merges, the ledger credits 100 points to you. You can watch it at `/adamtpang/repocoin/ledger`.

Nothing else earns: not opening PRs, not commits, not stars, not lines changed. Self-approvals and bot PRs never earn.

## Vesting

- A **7-day dispute window** follows each merge. Nothing vests during it.
- Then a **12-month vest** with a **1-month cliff**, vesting monthly after the cliff.
- Starting assumptions, not decisions.

## Treasury rules

- Unvested points return to the treasury if a credit is voided.
- The treasury holds no money in the prototype. No payouts, buybacks, or inflows.

## Rights

- **$REPO points**: in a later version, treasury governance and only the economic rights this constitution explicitly defines. In the prototype, none: they are a record of accepted work.
- **Reputation**: nontransferable, ever. 3 reputation from accepted work qualifies someone to post a reviewer bond.
- **Role bonds**: posted from vested points. They make a reviewer accountable. They never buy merge or write access.
- **Priority tiers for dependents**: a company that relies on repocoin reaches a tier by holding $REPO, counted once locked for 30 days so it cannot be flash-bought. Backer (1,000): priority triage on its issues. Partner (5,000): plus a support channel. Sponsor (20,000): plus roadmap votes. Thresholds are assumptions. Nothing is for sale in the prototype.
- Anyone can report a bug, open a pull request, or read the docs without holding anything.

## Retained maintainer powers

- Maintainers (admin or maintain permission) can void a farmed or mistaken credit by adding the `repocoin:void` label to the merged pull request. Vesting stops at that moment.
- Maintainers keep full control of the code, merges, and repo settings. $REPO is not copyright in the code.
- This constitution changes when a maintainer merges a new `.repocoin/constitution.md` into `main`.

## Market

- There is a **paper market** at `/adamtpang/repocoin/market`. It uses play money: paper credits are not redeemable, paper trades never move earned $REPO points, and no paper price is a price for any future token.
- Its job is to learn whether teams actually want priority tiers before anything is real.
- A real market, and turning points into a transferable token, comes only after a lawyer reviews the design and Adam decides to proceed.

## What $REPO is not

- Not money, not equity, not a security offering, and not a claim on revenue.
- Not a token you can sell today. No price and no implied return.
- Not a way to buy merge access, write access, or review rights.
