# Setup: what Adam still has to do

Draft settings only. Nothing here has been created. The agent that built the MVP did not register a GitHub App, create a Supabase project, set env vars, or deploy.

## 1. Supabase project (Adam creates it)

- Create a project on the free tier.
- Run `supabase/migrations/20261119000000_init.sql` in the SQL editor (or `npx supabase db push` with the CLI linked).
- Copy the URL, anon key, and service role key into the env vars below.
- Optional: regenerate types with `npx supabase gen types typescript` and replace `src/lib/store/rows.ts`.

## 2. GitHub App (Adam registers it)

Suggested settings at https://github.com/settings/apps/new:

| Setting | Value |
| --- | --- |
| Name | repocoin (or repocoin-dev while testing) |
| Homepage URL | https://repocoin.vercel.app |
| Webhook URL | `https://<preview or production host>/api/github/webhook` |
| Webhook secret | a long random string, stored only in `GITHUB_WEBHOOK_SECRET` |
| Repository permissions | Pull requests: Read-only. Contents: Read-only. Metadata: Read-only (default). |
| Subscribe to events | Pull request, Push. (Installation events are sent automatically.) |
| Where can it be installed | Only on this account, until Adam says otherwise |

Contents read is needed only to fetch `.repocoin/constitution.md`. Pull requests read is needed to list reviews. The App never writes to a repo.

Collaborator permission lookups (used for the void label) work with the Metadata permission. If GitHub refuses them on a given repo, add Members: Read-only for org repos.

After registering: generate a private key, note the App id, and install the App on the test repo Adam picks. Do not install it on a live product repo without his explicit yes.

## 3. Env vars (Adam sets them)

Names are in `.env.example`. Set them in the existing Vercel project `repocoin` only when Adam decides to deploy. Do not create a second Vercel project.

## 4. How a maintainer uses it

- **Connect**: install the App on the repo. The installer must be a repo admin, which GitHub enforces. A default constitution is published.
- **Publish a constitution**: merge `.repocoin/constitution.md` into the default branch. Protect the default branch, since anyone who can push there can change it.
- **Void a credit**: add the `repocoin:void` label to a merged PR. Only admin or maintain role counts. Vesting stops; unvested points return to the treasury.
- **Role bonds**: database only in this version. Insert a `role_bonds` row after checking eligibility (`checkBondEligibility` in `src/lib/bonds.ts`). There is no UI to post one.

## Known limits of this pass

- Approvals are read as GitHub's current review state; an approval on an earlier commit still counts unless the repo dismisses stale reviews. Turn on "Dismiss stale pull request approvals" on the test repo.
- One GitHub account per contributor is assumed, not detected.
- No dispute UI yet: the dispute window only delays vesting, and a maintainer void during it zeroes the credit.
- The fixture demo lives at the reserved owner slug `repocoin-demo`.
