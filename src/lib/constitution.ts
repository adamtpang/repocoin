import { CONSTITUTION_PATH, VOID_LABEL } from "./labels";
import type { ProjectParams } from "./types";

/**
 * The default constitution published when a repo is connected. It states, in
 * plain language, the sections docs/spec.md requires: supply and
 * allocations, vest, treasury rules, rights, retained maintainer powers, and
 * what the token is not. A maintainer replaces it by merging
 * `.repocoin/constitution.md` into the default branch.
 */
export function defaultConstitution(owner: string, repo: string, p: ProjectParams): string {
  return `# ${owner}/${repo} constitution

**Prototype points. Not money. Not a token you can sell.** This is a repocoin prototype. There is no live token, no payment, and no offering. Not legal advice.

## Supply and allocations

- Supply is not fixed in the prototype. Each credited merge mints **${p.pointsPerMerge} prototype points** to its author. (Assumption, not a decision.)
- Maintainer allocation: not set. Balaji's 2020 sketch has the lead dev hold X% and award the rest to contributors over time; the maintainer has not chosen X.
- Points cannot be bought, sold, or transferred in the prototype.

## How points are earned

- Only merged, reviewed, accepted work earns. Opens, commit counts, stars, and lines changed earn nothing.
- A pull request earns only when it is merged into the default branch and has a current approving review from a qualified reviewer who is not the author.
- Qualified reviewers: the repo's owners, org members, and collaborators, plus anyone holding an active reviewer bond.
- Self-approvals never earn. Bot-authored pull requests never earn.

## Vesting

- A **${p.disputeWindowDays}-day dispute window** follows each merge. Nothing vests during it.
- Then a **${p.vestMonths}-month vest** with a **${p.cliffMonths}-month cliff**, vesting monthly after the cliff.
- These are starting assumptions from the repocoin brief, not decisions.

## Treasury rules

- Unvested points return to the treasury if a credit is voided.
- The treasury holds no money in the prototype. There are no payouts, buybacks, or inflows.

## Rights

- **Project points**: in a later version, treasury governance and only the economic rights this constitution explicitly defines. In the prototype, none: they are a record.
- **Reputation**: nontransferable, ever. It qualifies someone for bonded roles (reviewer, steward) after ${p.minReputationToBond} reputation from accepted work.
- **Role bonds**: posted from vested points, mocked in the database. A bond makes a role holder accountable. It does not buy merge or write access.
- **Dependents** (companies that run this code): priority fixes, support, and roadmap say are described here as future utilities. None are for sale in the prototype.
- No one needs points to report a bug, open a pull request, or read the docs.

## Retained maintainer powers

- Maintainers (admin or maintain permission) can void a farmed or mistaken credit by adding the \`${VOID_LABEL}\` label to the merged pull request. Vesting stops at that moment.
- Maintainers keep full control of the code, merges, and repo settings. Points are not copyright in the code.
- This constitution changes when a maintainer merges a new \`${CONSTITUTION_PATH}\` into the default branch.

## What the token is not

- Not money, not equity, not a security offering, and not a claim on revenue.
- Not a token you can sell. No market, no price, no implied return.
- Not a way to buy merge access, write access, or review rights.
`;
}
