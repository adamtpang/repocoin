import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { day, FixtureBanner, NotConnected, ProjectHeader, Section } from "@/components/ui";
import { authConfigured, getViewer } from "@/lib/auth";
import { computeBalances, paperPositions } from "@/lib/balances";
import { parseTicker } from "@/lib/constitution";
import { bookLevels, PAPER_START_CREDITS } from "@/lib/market";
import { PLAY_MONEY } from "@/lib/labels";
import { getReadStore } from "@/lib/store";
import { tierFor } from "@/lib/tiers";
import { cancelOrder } from "./actions";
import { OrderForm } from "./OrderForm";

type Params = Promise<{ owner: string; repo: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { owner, repo } = await params;
  return { title: `${owner}/${repo} paper market · repocoin` };
}

const n = (v: number) => v.toLocaleString("en-US");

export default async function MarketPage({ params }: { params: Params }) {
  await connection();
  const { owner, repo } = await params;
  const { store, mode } = await getReadStore(owner);
  const project = store ? await store.getProjectBySlug(owner, repo) : null;
  if (!store || !project) return <NotConnected owner={owner} repo={repo} mode={mode} />;

  const ticker = parseTicker(project.constitutionMarkdown) ?? "points";
  const unit = ticker === "points" ? "points" : `$${ticker}`;
  const now = new Date();
  const [credits, ledger, bonds, open, fills, accounts, viewer] = await Promise.all([
    store.listCredits(project.id),
    store.listLedger(project.id),
    store.listBonds(project.id),
    store.listOpenPaperOrders(project.id),
    store.listPaperFills(project.id, 20),
    store.listPaperAccounts(project.id),
    mode === "fixture" ? Promise.resolve(null) : getViewer(),
  ]);
  const positions = paperPositions(computeBalances(credits, ledger, bonds, now), accounts, PAPER_START_CREDITS);
  const { bids, asks } = bookLevels(open);
  const last = fills[0]?.price ?? null;
  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  const myOrders = viewer ? open.filter((o) => o.userId === viewer.githubUserId) : [];
  const here = `/${project.owner}/${project.repo}/market`;

  return (
    <div>
      <FixtureBanner mode={mode} />
      <ProjectHeader project={project} active="market" />
      <p className="rounded-md border border-warn/40 px-4 py-3 text-sm text-warn">{PLAY_MONEY}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Last paper price" value={last} />
        <Stat label="Best bid" value={bestBid} />
        <Stat label="Best ask" value={bestAsk} />
      </div>
      <p className="mt-2 text-sm text-muted">Prices are paper credits per {unit} point.</p>

      <Section kicker="How it works" title="A practice market">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
          <li>Contributors can offer up to their vested, unbonded {unit} points on paper.</li>
          <li>Anyone signed in with GitHub starts with {n(PAPER_START_CREDITS)} paper credits (an assumption) to bid with.</li>
          <li>Orders match by best price, then time, at the resting order&apos;s price. You never trade with yourself.</li>
          <li>Your paper holding shows which priority tier it would reach. The point is to learn whether teams want tiers, before anything is real.</li>
        </ul>
      </Section>

      <Section kicker="Trade" title="Place a paper order">
        {mode === "fixture" ? (
          <p className="text-sm text-muted">The fixture demo is read-only. Its orders were placed by fake people.</p>
        ) : !authConfigured() ? (
          <p className="text-sm text-muted">Sign-in is not configured on this deployment yet.</p>
        ) : !viewer ? (
          <Link href={`/auth/signin?next=${encodeURIComponent(here)}`}>Sign in with GitHub to trade on paper</Link>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted">
              Signed in as {viewer.login}.{" "}
              <form action={`/auth/signout?next=${encodeURIComponent(here)}`} method="post" className="inline">
                <button type="submit" className="text-accent underline underline-offset-2">Sign out</button>
              </form>
            </div>
            <OrderForm owner={project.owner} repo={project.repo} ticker={unit} />
            {myOrders.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm">
                {myOrders.map((o) => (
                  <li key={o.id} className="flex items-center gap-3">
                    <span className="num">
                      {o.side} {n(o.remaining)} @ {n(o.price)}
                    </span>
                    <form action={cancelOrder}>
                      <input type="hidden" name="owner" value={project.owner} />
                      <input type="hidden" name="repo" value={project.repo} />
                      <input type="hidden" name="orderId" value={o.id} />
                      <button type="submit" className="text-muted underline underline-offset-2">Cancel</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Section>

      <Section kicker="Order book" title="Bids and asks">
        <div className="grid gap-6 sm:grid-cols-2">
          <Levels title="Bids (buy)" levels={bids} empty="No bids." />
          <Levels title="Asks (sell)" levels={asks} empty="No asks." />
        </div>
      </Section>

      <Section kicker="Positions" title="Paper holdings and the tier they would reach">
        <div className="table-wrap">
          <table className="rc">
            <caption>{PLAY_MONEY}</caption>
            <thead>
              <tr>
                <th>Account</th>
                <th className="r">Paper {unit}</th>
                <th className="r">Paper credits</th>
                <th>Tier it would reach</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.githubUserId}>
                  <td>{p.login}</td>
                  <td className="r num">{n(p.units)}</td>
                  <td className="r num">{n(p.credits)}</td>
                  <td>{tierFor(p.units).name}</td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr><td colSpan={4} className="text-muted">No positions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="Tape" title="Recent paper fills">
        <ul className="space-y-2 text-sm">
          {fills.map((f) => (
            <li key={f.id} className="flex gap-3">
              <span className="num shrink-0 text-muted">{day(f.createdAt)}</span>
              <span>
                {f.buyerLogin} bought <span className="num">{n(f.qty)}</span> from {f.sellerLogin} at{" "}
                <span className="num">{n(f.price)}</span> paper credits
              </span>
            </li>
          ))}
          {fills.length === 0 && <li className="text-muted">No fills yet.</li>}
        </ul>
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-md border border-line p-4">
      <p className="mark mb-1 text-muted">{label}</p>
      <p className="num text-lg">{value === null ? "none" : `${n(value)} cr`}</p>
    </div>
  );
}

function Levels({ title, levels, empty }: { title: string; levels: { price: number; qty: number; orders: number }[]; empty: string }) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <table className="rc">
        <thead>
          <tr>
            <th className="r">Price</th>
            <th className="r">Qty</th>
            <th className="r">Orders</th>
          </tr>
        </thead>
        <tbody>
          {levels.slice(0, 10).map((l) => (
            <tr key={l.price}>
              <td className="r num">{n(l.price)}</td>
              <td className="r num">{n(l.qty)}</td>
              <td className="r num">{l.orders}</td>
            </tr>
          ))}
          {levels.length === 0 && (
            <tr><td colSpan={3} className="text-muted">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
