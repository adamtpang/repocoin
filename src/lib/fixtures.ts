import { computeBalances } from "./balances";
import { checkBondEligibility } from "./bonds";
import { closedPrPayload, FakeGitHub, installPayload, review } from "./github/fake";
import { defaultConstitution } from "./constitution";
import { CONSTITUTION_PATH, DEMO_OWNER, VOID_LABEL } from "./labels";
import { DEFAULT_PARAMS } from "./types";
import { MemoryStore } from "./store/memory";
import { handleWebhook } from "./webhook";

/**
 * The fixture demo at /repocoin-demo/sample-repo. Fake people, fake PRs, run
 * through the same webhook pipeline a real install uses, with dates relative
 * to server start. Not a live install. All balances are prototype points.
 */
const DAY = 24 * 60 * 60 * 1000;

export const DEMO_REPO = "sample-repo";

const people = {
  mara: { id: 1001, login: "maintainer-mara" },
  ana: { id: 2001, login: "dev-ana" },
  ben: { id: 2002, login: "dev-ben" },
  sam: { id: 2003, login: "spam-sam" },
  bot: { id: 9001, login: "dependabot[bot]", type: "Bot" },
};

let cached: Promise<MemoryStore> | null = null;

export function demoStore(): Promise<MemoryStore> {
  cached ??= buildDemo(new Date());
  return cached;
}

async function buildDemo(start: Date): Promise<MemoryStore> {
  let clock = new Date(start.getTime() - 460 * DAY);
  const store = new MemoryStore(() => clock);
  const github = new FakeGitHub();
  const ago = (days: number) => new Date(start.getTime() - days * DAY).toISOString();
  const fullName = `${DEMO_OWNER}/${DEMO_REPO}`;
  const repoId = 424242;
  const installationId = 77;
  const deps = { store, github, now: () => clock };
  let n = 0;
  const send = (event: string, payload: object) =>
    handleWebhook(event, `fixture-${++n}`, payload, deps);

  github.roles.set(people.mara.login, "admin");
  github.files.set(CONSTITUTION_PATH, defaultConstitution(DEMO_OWNER, DEMO_REPO, DEFAULT_PARAMS, "SMPL"));
  await send("installation", installPayload({ installationId, repoId, fullName, sender: people.mara }));

  const merge = async (
    number: number,
    title: string,
    author: { id: number; login: string; type?: string },
    daysAgo: number,
    reviews: ReturnType<typeof review>[],
  ) => {
    github.reviews.set(number, reviews);
    clock = new Date(start.getTime() - daysAgo * DAY);
    await send(
      "pull_request",
      closedPrPayload({
        repoId,
        fullName,
        installationId,
        number,
        title,
        author,
        mergedAt: ago(daysAgo),
        sha: `fixture${number.toString().padStart(4, "0")}`,
      }),
    );
  };
  const approvedByMara = (daysAgo: number) => [review(people.mara, "APPROVED", "OWNER", ago(daysAgo + 1))];

  await merge(9, "Fix off-by-one in pagination", people.ana, 450, approvedByMara(450));
  await merge(12, "Add retry with backoff to the HTTP client", people.ana, 400, approvedByMara(400));
  await merge(15, "Document the config file format", people.ana, 300, approvedByMara(300));
  await merge(18, "Stream large responses instead of buffering", people.ben, 120, approvedByMara(120));
  await merge(19, "Rename variables in utils", people.sam, 90, approvedByMara(90));

  // Maintainer voids the farmed PR #19 forty days ago.
  clock = new Date(start.getTime() - 40 * DAY);
  await send("pull_request", {
    action: "labeled",
    label: { name: VOID_LABEL },
    installation: { id: installationId },
    repository: { id: repoId, name: DEMO_REPO, full_name: fullName },
    sender: people.mara,
    pull_request: { number: 19 },
  });

  // dev-ana has 3 reputation and vested points, so she posts a reviewer bond.
  clock = new Date(start.getTime() - 30 * DAY);
  const project = (await store.getProjectBySlug(DEMO_OWNER, DEMO_REPO))!;
  const ana = computeBalances(
    await store.listCredits(project.id),
    await store.listLedger(project.id),
    await store.listBonds(project.id),
    clock,
  ).find((b) => b.githubUserId === people.ana.id)!;
  const check = checkBondEligibility({
    role: "reviewer",
    bondPoints: 50,
    reputation: ana.reputation,
    vestedPoints: ana.vestedPoints,
    alreadyBondedPoints: ana.bondedPoints,
    hasActiveBondForRole: false,
    params: project.params,
  });
  if (!check.ok) throw new Error(`fixture bond refused: ${check.reason}`);
  await store.insertBond({
    projectId: project.id,
    githubUserId: people.ana.id,
    githubLogin: people.ana.login,
    role: "reviewer",
    bondPoints: 50,
  });

  // Approved only by dev-ana, who qualifies through her bond, not a balance.
  await merge(24, "Add timeout option to the client", people.ben, 20, [
    review(people.ana, "APPROVED", "CONTRIBUTOR", ago(21)),
  ]);
  await merge(26, "Fix flaky test on Windows paths", people.ben, 3, approvedByMara(3));

  // Not credited: self-approval, no review, bot author.
  await merge(22, "Add my name to README", people.sam, 30, [
    review(people.sam, "APPROVED", "CONTRIBUTOR", ago(31)),
  ]);
  await merge(23, "Whitespace cleanup", people.sam, 25, []);
  await merge(25, "Bump lodash from 4.17.20 to 4.17.21", people.bot, 15, approvedByMara(15));

  return store;
}
