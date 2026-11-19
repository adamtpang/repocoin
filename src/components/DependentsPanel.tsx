import { NOT_MONEY } from "@/lib/labels";
import { PRIORITY_TIERS, TIER_LOCK_DAYS } from "@/lib/tiers";
import { Pts, Section } from "./ui";

const UTILITIES = [
  {
    title: "Priority fixes",
    body: "Companies that run this code could back the project to move their bugs and features up the queue, the way Balaji's 2020 sketch has companies buying the token to prioritize work.",
  },
  {
    title: "Support",
    body: "A direct line to the people who know the codebase, for dependents that need answers on a deadline.",
  },
  {
    title: "Roadmap say",
    body: "A voice in roadmap votes, exactly as the constitution defines it. Not informal influence, and never write access.",
  },
];

/**
 * Describes what a dependent could get. Descriptive only: there is no
 * checkout, no price, and no payment in the prototype.
 */
export function DependentsPanel() {
  return (
    <Section kicker="For companies that depend on this repo" title="Dependents">
      <p className="mb-5 max-w-2xl text-muted">
        Demand should come from teams whose software runs on this repo, not from the next trader.
        Reporting bugs, opening pull requests, and reading the docs stay open to everyone, with or
        without points.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {UTILITIES.map((u) => (
          <div key={u.title} className="rounded-md border border-line p-4">
            <h3 className="mb-2 font-medium">{u.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{u.body}</p>
          </div>
        ))}
      </div>
      <h3 className="mb-3 mt-8 font-medium">Priority tiers</h3>
      <div className="table-wrap">
        <table className="rc">
          <caption>
            Tier by locked holding, counted after {TIER_LOCK_DAYS} days locked so it cannot be
            flash-bought. Thresholds are assumptions. {NOT_MONEY}
          </caption>
          <thead>
            <tr>
              <th>Tier</th>
              <th className="r">Holding</th>
              <th>What it gets</th>
            </tr>
          </thead>
          <tbody>
            {PRIORITY_TIERS.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td>
                <td className="r whitespace-nowrap">
                  {t.minHolding === 0 ? <span className="text-muted">none</span> : <Pts value={t.minHolding} />}
                </td>
                <td className="text-muted">{t.perks.join(". ")}.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="cursor-not-allowed rounded-md border border-line px-4 py-2 text-sm text-muted"
        >
          Back this project
        </button>
        <span className="text-sm text-muted">
          Not available in the prototype. No payments, no checkout, no implied return.
        </span>
      </div>
    </Section>
  );
}
