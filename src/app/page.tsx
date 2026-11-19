import Link from "next/link";
import { NotMoney, Section } from "@/components/ui";

const STEPS = [
  {
    n: "1",
    title: "Attach",
    body: "A repo admin installs the repocoin GitHub App. The repo gets a constitution that says, in plain language, what its points are and are not.",
  },
  {
    n: "2",
    title: "Make it integral",
    body: "Points are meant to mean something inside the repo: priority on issues and features, support, and roadmap say for the teams that depend on it.",
  },
  {
    n: "3",
    title: "Earn",
    body: "Contributors earn a vesting stake only when a reviewed pull request merges. No credit for opens, commits, stars, or self-approvals.",
  },
  {
    n: "4",
    title: "Value, later",
    body: "Once a market is shown, the points could become a real token. Not in this prototype, and not without a lawyer.",
  },
];

export default function Home() {
  return (
    <div>
      <p className="mark mb-4">Prototype</p>
      <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">repocoin</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        Attach a token to a GitHub repo, make it part of how the repo is used, and let contributors
        earn it through merged, reviewed work. A real cap table for a repo, not a ticker stapled onto
        a README.
      </p>
      <NotMoney className="mt-4" />
      <p className="mt-6">
        <Link href="/repocoin-demo/sample-repo">See the fixture demo</Link>
        <span className="text-muted"> · </span>
        <Link href="/repocoin-demo/sample-repo/ledger">its ledger</Link>
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-md border border-line p-5">
            <p className="mark mb-2">Step {s.n}</p>
            <h2 className="mb-2 text-lg font-medium">{s.title}</h2>
            <p className="text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <Section kicker="The loop this builds toward" title="Balaji Srinivasan, 10 November 2020">
        <blockquote className="border-l-2 border-accent pl-4 leading-relaxed">
          <p>A new way to fund open source?</p>
          <ul className="mt-2 list-none space-y-0.5">
            <li>- Be open source dev</li>
            <li>- Issue a token</li>
            <li>- Hold X% of it</li>
            <li>- Has 0 value initially</li>
            <li>- Award (100-X)% of it over time to folks who contribute code</li>
            <li>- Companies then buy token to prioritize bugs &amp; features</li>
            <li>- Suddenly, an economy arises!</li>
          </ul>
        </blockquote>
        <p className="mt-4 text-sm text-muted">
          <a href="https://x.com/balajis/status/1326313315044192256">
            x.com/balajis/status/1326313315044192256
          </a>
        </p>
      </Section>

      <Section kicker="Two ledgers" title="Points and reputation are different things">
        <ul className="space-y-3 leading-relaxed">
          <li>
            <strong>Project points</strong> stand in for a future transferable token. In the prototype
            they cannot be bought, sold, or moved.
          </li>
          <li>
            <strong>Reputation</strong> is nontransferable, ever. It qualifies someone for bonded roles
            like reviewer or steward.
          </li>
          <li>
            <strong>Role bonds</strong> make a reviewer accountable. They never buy merge or write
            access.
          </li>
        </ul>
      </Section>
    </div>
  );
}
