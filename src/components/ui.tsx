import Link from "next/link";
import { parseTicker } from "@/lib/constitution";
import { NOT_MONEY } from "@/lib/labels";
import type { DataMode } from "@/lib/store";
import type { Project } from "@/lib/types";

/** The required label. Rendered next to every balance. */
export function NotMoney({ className = "" }: { className?: string }) {
  return <p className={`text-sm text-warn ${className}`}>{NOT_MONEY}</p>;
}

/** A prototype point amount. Always carries a "pts" unit and the full label on hover. */
export function Pts({ value }: { value: number }) {
  return (
    <span className="num" title={NOT_MONEY}>
      {value.toLocaleString("en-US")} pts
    </span>
  );
}

export function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 rounded-md border border-line bg-panel p-5 sm:p-6">
      {kicker && <p className="mark mb-2">{kicker}</p>}
      <h2 className="mb-4 text-xl font-medium">{title}</h2>
      {children}
    </section>
  );
}

export function FixtureBanner({ mode }: { mode: DataMode }) {
  if (mode !== "fixture") return null;
  return (
    <p className="mb-6 rounded-md border border-warn/40 px-4 py-3 text-sm text-warn">
      Fixture data. Fake people and pull requests run through the real credit pipeline. Not a live
      install.
    </p>
  );
}

export function ProjectHeader({
  project,
  active,
}: {
  project: Project;
  active: "constitution" | "ledger" | "market";
}) {
  const base = `/${project.owner}/${project.repo}`;
  const ticker = parseTicker(project.constitutionMarkdown);
  const tab = (href: string, label: string, on: boolean) => (
    <Link
      href={href}
      className={`no-underline ${on ? "text-fg border-b border-accent" : "text-muted hover:text-fg"} pb-1`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-8">
      <p className="mark mb-2">{project.connected ? "Connected repo" : "Disconnected repo"}</p>
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
        {project.owner}/{project.repo}
        {ticker && <span className="num ml-3 align-middle text-lg text-accent">${ticker}</span>}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Default branch <code className="num">{project.defaultBranch}</code>
        {project.installerLogin && <> · connected by {project.installerLogin}</>}
      </p>
      <nav className="mt-6 flex gap-6 text-sm">
        {tab(base, "Constitution", active === "constitution")}
        {tab(`${base}/ledger`, "Ledger", active === "ledger")}
        {tab(`${base}/market`, "Paper market", active === "market")}
      </nav>
    </div>
  );
}

export function NotConnected({ owner, repo, mode }: { owner: string; repo: string; mode: DataMode }) {
  return (
    <div>
      <p className="mark mb-2">Not connected</p>
      <h1 className="text-3xl font-medium tracking-tight">
        {owner}/{repo}
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        {mode === "unconfigured"
          ? "This deployment has no database configured yet, so only the fixture demo is available."
          : "No maintainer has connected this repo. A repo admin connects it by installing the repocoin GitHub App."}
      </p>
      <p className="mt-6">
        <Link href="/repocoin-demo/sample-repo">See the fixture demo</Link>
      </p>
    </div>
  );
}

export const day = (iso: string) => iso.slice(0, 10);
