import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import ReactMarkdown from "react-markdown";
import { DependentsPanel } from "@/components/DependentsPanel";
import { day, FixtureBanner, NotConnected, NotMoney, ProjectHeader, Section } from "@/components/ui";
import { ASSUMPTION } from "@/lib/labels";
import { getReadStore } from "@/lib/store";

type Params = Promise<{ owner: string; repo: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { owner, repo } = await params;
  return { title: `${owner}/${repo} constitution · repocoin` };
}

export default async function ConstitutionPage({ params }: { params: Params }) {
  await connection();
  const { owner, repo } = await params;
  const { store, mode } = await getReadStore(owner);
  const project = store ? await store.getProjectBySlug(owner, repo) : null;
  if (!project) return <NotConnected owner={owner} repo={repo} mode={mode} />;
  const p = project.params;

  return (
    <div>
      <FixtureBanner mode={mode} />
      <ProjectHeader project={project} active="constitution" />
      <NotMoney />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_16rem]">
        <article className="prose-rc min-w-0">
          <ReactMarkdown skipHtml>{project.constitutionMarkdown}</ReactMarkdown>
          <p className="mt-6 text-sm text-muted">
            Published {day(project.constitutionUpdatedAt)}. A maintainer changes it by merging{" "}
            <code>.repocoin/constitution.md</code> into {project.defaultBranch}.
          </p>
        </article>

        <aside className="h-fit rounded-md border border-line p-4 text-sm">
          <p className="mark mb-3">Parameters</p>
          <dl className="space-y-2">
            <Param label="Points per credited merge" value={`${p.pointsPerMerge} pts`} />
            <Param label="Dispute window" value={`${p.disputeWindowDays} days`} />
            <Param label="Cliff" value={`${p.cliffMonths} month${p.cliffMonths === 1 ? "" : "s"}`} />
            <Param label="Vest" value={`${p.vestMonths} months, monthly`} />
            <Param label="Reputation to post a bond" value={`${p.minReputationToBond}`} />
          </dl>
          <p className="mt-4 text-xs text-muted">{ASSUMPTION}.</p>
          <p className="mt-4">
            <Link href={`/${project.owner}/${project.repo}/ledger`}>Open the public ledger</Link>
          </p>
        </aside>
      </div>

      <DependentsPanel />

      <Section title="Open questions, not decided here">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Vest and dispute parameters (the values above are assumptions).</li>
          <li>Who may review in v1: maintainers only, or bonded reviewers too.</li>
          <li>Points for the whole prototype, or a named public testnet later.</li>
          <li>Foundation jurisdiction and any geo-block: a lawyer&apos;s call, not this app&apos;s.</li>
        </ul>
      </Section>
    </div>
  );
}

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="num whitespace-nowrap">{value}</dd>
    </div>
  );
}
