import type { Metadata } from "next";
import { connection } from "next/server";
import { DependentsPanel } from "@/components/DependentsPanel";
import { day, FixtureBanner, NotConnected, NotMoney, ProjectHeader, Pts, Section } from "@/components/ui";
import { computeBalances, totals } from "@/lib/balances";
import { REJECT_LABEL, type RejectReason } from "@/lib/credit";
import { NOT_MONEY, REPUTATION_LABEL, VOID_LABEL } from "@/lib/labels";
import { getReadStore } from "@/lib/store";
import type { AuditEntry } from "@/lib/types";
import { PHASE_LABEL, vestedPoints, vestPhase } from "@/lib/vesting";

type Params = Promise<{ owner: string; repo: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { owner, repo } = await params;
  return { title: `${owner}/${repo} ledger · repocoin` };
}

export default async function LedgerPage({ params }: { params: Params }) {
  await connection();
  const { owner, repo } = await params;
  const { store, mode } = await getReadStore(owner);
  const project = store ? await store.getProjectBySlug(owner, repo) : null;
  if (!store || !project) return <NotConnected owner={owner} repo={repo} mode={mode} />;

  const now = new Date();
  const [credits, ledger, bonds, audit] = await Promise.all([
    store.listCredits(project.id),
    store.listLedger(project.id),
    store.listBonds(project.id),
    store.listAudit(project.id, 25),
  ]);
  const balances = computeBalances(credits, ledger, bonds, now);
  const t = totals(balances);
  const byRep = [...balances].filter((b) => b.reputation !== 0).sort((a, b) => b.reputation - a.reputation);

  return (
    <div>
      <FixtureBanner mode={mode} />
      <ProjectHeader project={project} active="ledger" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Tile label="Granted" value={t.granted} />
        <Tile label="Vested" value={t.vested} />
        <Tile label="Unvested" value={t.unvested} />
        <Tile label="Returned to treasury" value={t.returned} />
        <Tile label="Bonded" value={t.bonded} />
      </div>
      <NotMoney className="mt-3" />

      <Section kicker="Ledger 1 of 2" title="Project points">
        <p className="mb-4 max-w-2xl text-sm text-muted">
          Stand-ins for a future transferable token. Not transferable in the prototype. Earned only
          from merged, reviewed pull requests.
        </p>
        <div className="table-wrap">
          <table className="rc">
            <caption>{NOT_MONEY}</caption>
            <thead>
              <tr>
                <th>Contributor</th>
                <th className="r">Vested</th>
                <th className="r">Unvested</th>
                <th className="r">Returned</th>
                <th className="r">Bonded</th>
              </tr>
            </thead>
            <tbody>
              {balances.filter((b) => b.grantedPoints > 0 || b.bondedPoints > 0).map((b) => (
                <tr key={b.githubUserId}>
                  <td>{b.login}</td>
                  <td className="r"><Pts value={b.vestedPoints} /></td>
                  <td className="r"><Pts value={b.unvestedPoints} /></td>
                  <td className="r"><Pts value={b.returnedPoints} /></td>
                  <td className="r"><Pts value={b.bondedPoints} /></td>
                </tr>
              ))}
              {balances.length === 0 && <EmptyRow cols={5} text="No credited merges yet." />}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="Ledger 2 of 2" title="Reputation">
        <p className="mb-4 max-w-2xl text-sm text-muted">
          One point for authoring a credited merge, one for approving it. A void reverses the
          author&apos;s point. Reputation qualifies someone for bonded roles. It cannot be bought,
          sold, or moved.
        </p>
        <div className="table-wrap">
          <table className="rc">
            <caption>{REPUTATION_LABEL}</caption>
            <thead>
              <tr>
                <th>Person</th>
                <th className="r">Reputation</th>
              </tr>
            </thead>
            <tbody>
              {byRep.map((b) => (
                <tr key={b.githubUserId}>
                  <td>{b.login}</td>
                  <td className="r num">{b.reputation}</td>
                </tr>
              ))}
              {byRep.length === 0 && <EmptyRow cols={2} text="No reputation yet." />}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="Database mock" title="Role bonds">
        <p className="mb-4 max-w-2xl text-sm text-muted">
          A bond is posted from vested points for a role (reviewer or steward) and needs{" "}
          {project.params.minReputationToBond} reputation first. It makes the role holder
          accountable. Points cannot be bought here, and no balance or bond grants merge or write
          access.
        </p>
        <div className="table-wrap">
          <table className="rc">
            <caption>{NOT_MONEY}</caption>
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Status</th>
                <th className="r">Bond</th>
              </tr>
            </thead>
            <tbody>
              {bonds.map((b) => (
                <tr key={b.id}>
                  <td>{b.githubLogin}</td>
                  <td>{b.role}</td>
                  <td>{b.status}</td>
                  <td className="r"><Pts value={b.bondPoints} /></td>
                </tr>
              ))}
              {bonds.length === 0 && <EmptyRow cols={4} text="No bonds posted." />}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="Accepted work" title="Credited pull requests">
        <p className="mb-4 max-w-2xl text-sm text-muted">
          A maintainer voids a credit by adding the <code className="num">{VOID_LABEL}</code> label
          to the merged pull request. Vesting stops at that moment.
        </p>
        <div className="table-wrap">
          <table className="rc">
            <caption>{NOT_MONEY}</caption>
            <thead>
              <tr>
                <th>PR</th>
                <th>Author</th>
                <th>Approved by</th>
                <th>Merged</th>
                <th>Status</th>
                <th className="r">Vested / granted</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((c) => {
                const phase = vestPhase(c, now);
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="num">#{c.prNumber}</span> {c.title}
                    </td>
                    <td>{c.authorLogin}</td>
                    <td>{c.reviewerLogin}</td>
                    <td className="num whitespace-nowrap">{day(c.mergedAt)}</td>
                    <td className={phase === "voided" ? "text-bad" : ""}>
                      {PHASE_LABEL[phase]}
                      {phase === "dispute_window" && (
                        <span className="block text-xs text-muted">until {day(c.disputeEndsAt)}</span>
                      )}
                      {phase === "before_cliff" && (
                        <span className="block text-xs text-muted">cliff {day(c.cliffAt)}</span>
                      )}
                    </td>
                    <td className="r whitespace-nowrap">
                      <Pts value={vestedPoints(c, now)} /> <span className="text-muted">/ {c.points}</span>
                    </td>
                  </tr>
                );
              })}
              {credits.length === 0 && <EmptyRow cols={6} text="No credited merges yet." />}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="Audit log" title="Recent decisions">
        <ul className="space-y-2 text-sm">
          {audit.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span className="num shrink-0 text-muted">{day(a.createdAt)}</span>
              <span>{describe(a)}</span>
            </li>
          ))}
          {audit.length === 0 && <li className="text-muted">Nothing yet.</li>}
        </ul>
      </Section>

      <DependentsPanel />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line p-4">
      <p className="mark mb-1 text-muted">{label}</p>
      <p className="text-lg"><Pts value={value} /></p>
    </div>
  );
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="text-muted">{text}</td>
    </tr>
  );
}

function describe(a: AuditEntry): string {
  const d = a.detail as Record<string, string | number>;
  switch (a.action) {
    case "credit_merge":
      return `Credited PR #${d.pr_number} by ${a.actorLogin}, approved by ${d.reviewer}.`;
    case "credit_rejected":
      return `Not credited: PR #${d.pr_number} by ${a.actorLogin}. ${REJECT_LABEL[d.reason as RejectReason] ?? d.reason}.`;
    case "void_credit":
      return `${a.actorLogin} voided PR #${d.pr_number}. ${d.returned_points} unvested pts returned to treasury.`;
    case "void_denied":
      return `${a.actorLogin} tried to void PR #${d.pr_number} without admin or maintain role. Refused.`;
    case "connect":
      return `${a.actorLogin} connected the repo by installing the GitHub App.`;
    case "publish_constitution":
      return `Constitution republished from the default branch.`;
    default:
      return a.action;
  }
}
