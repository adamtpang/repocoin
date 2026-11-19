import { createSign } from "node:crypto";
import type { PullReview, ReviewState } from "../credit";

export type RepoRole = "admin" | "maintain" | "write" | "triage" | "read" | "none";

/** The GitHub reads the webhook handler needs. Faked in tests. */
export interface GitHubApi {
  listReviews(installationId: number, owner: string, repo: string, prNumber: number): Promise<PullReview[]>;
  getRole(installationId: number, owner: string, repo: string, login: string): Promise<RepoRole>;
  getDefaultBranch(installationId: number, owner: string, repo: string): Promise<string>;
  /** Returns null when the file does not exist at that ref. */
  getFile(installationId: number, owner: string, repo: string, path: string, ref: string): Promise<string | null>;
}

const API = "https://api.github.com";

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** GitHub App client using an App JWT exchanged for installation tokens. */
export class GitHubAppApi implements GitHubApi {
  private tokens = new Map<number, { token: string; expiresAt: number }>();

  constructor(
    private appId: string,
    private privateKey: string,
  ) {}

  private appJwt(): string {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: this.appId }));
    const signer = createSign("RSA-SHA256");
    signer.update(`${header}.${payload}`);
    return `${header}.${payload}.${base64url(signer.sign(this.privateKey))}`;
  }

  private async installationToken(installationId: number): Promise<string> {
    const cached = this.tokens.get(installationId);
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;
    const res = await fetch(`${API}/app/installations/${installationId}/access_tokens`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.appJwt()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) throw new Error(`GitHub installation token request failed: ${res.status}`);
    const body = (await res.json()) as { token: string; expires_at: string };
    this.tokens.set(installationId, { token: body.token, expiresAt: Date.parse(body.expires_at) });
    return body.token;
  }

  private async get(installationId: number, path: string): Promise<Response> {
    const token = await this.installationToken(installationId);
    return fetch(`${API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  }

  async listReviews(installationId: number, owner: string, repo: string, prNumber: number) {
    const out: PullReview[] = [];
    for (let page = 1; page <= 10; page++) {
      const res = await this.get(
        installationId,
        `/repos/${owner}/${repo}/pulls/${prNumber}/reviews?per_page=100&page=${page}`,
      );
      if (!res.ok) throw new Error(`GitHub reviews request failed: ${res.status}`);
      const rows = (await res.json()) as Array<{
        user: { id: number; login: string; type: string } | null;
        state: string;
        author_association: string;
        submitted_at: string | null;
      }>;
      for (const r of rows) {
        if (!r.user || !r.submitted_at) continue;
        out.push({
          userId: r.user.id,
          userLogin: r.user.login,
          userType: r.user.type,
          state: r.state as ReviewState,
          authorAssociation: r.author_association,
          submittedAt: r.submitted_at,
        });
      }
      if (rows.length < 100) break;
    }
    return out;
  }

  async getRole(installationId: number, owner: string, repo: string, login: string): Promise<RepoRole> {
    const res = await this.get(installationId, `/repos/${owner}/${repo}/collaborators/${login}/permission`);
    if (res.status === 404) return "none";
    if (!res.ok) throw new Error(`GitHub permission request failed: ${res.status}`);
    const body = (await res.json()) as { permission: string; role_name?: string };
    return (body.role_name ?? body.permission) as RepoRole;
  }

  async getDefaultBranch(installationId: number, owner: string, repo: string) {
    const res = await this.get(installationId, `/repos/${owner}/${repo}`);
    if (!res.ok) throw new Error(`GitHub repo request failed: ${res.status}`);
    return ((await res.json()) as { default_branch: string }).default_branch;
  }

  async getFile(installationId: number, owner: string, repo: string, path: string, ref: string) {
    const res = await this.get(
      installationId,
      `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub contents request failed: ${res.status}`);
    const body = (await res.json()) as { content: string; encoding: string };
    return Buffer.from(body.content, body.encoding === "base64" ? "base64" : "utf8").toString("utf8");
  }
}
