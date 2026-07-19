# Personal Website Vercel Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the public personal website to native Next.js on Vercel, connect GitHub `main` for automatic production deployments, and move `zhangjinglongai.com` with no visitor-visible downtime.

**Architecture:** Replace the current vinext/Cloudflare build path with the existing app's native Next.js runtime while leaving page content and visuals untouched. Create and verify a Vercel preview before connecting the GitHub repository, then fast-forward the verified source to `main`, add both domains, and change only the Alibaba Cloud DNS records needed to move traffic. Keep the existing ChatGPT Sites deployment available for seven days as the rollback target.

**Tech Stack:** Next.js 16.2.6, React 19.2.6, TypeScript 5.9.3, Node.js test runner, ESLint 9, Vercel CLI, GitHub, Alibaba Cloud DNS.

## Global Constraints

- Do not change page copy, layout, colors, images, external links, metadata, or responsive behavior.
- Keep `next/image` components `unoptimized` during the migration.
- Do not add a database, environment variable, API route, or authentication flow.
- Use Vercel's native Next.js Framework Preset and default build output.
- GitHub `long32132/personal-website` uses `main` as the production branch.
- `zhangjinglongai.com` remains canonical; `www.zhangjinglongai.com` redirects permanently to it.
- Keep the current ChatGPT Sites deployment public and undeleted for seven days after DNS cutover.
- Do not change Alibaba Cloud nameservers; use the exact A, CNAME, and verification values returned by the linked Vercel project.

---

### Task 1: Lock the native Next.js migration contract with tests

**Files:**
- Modify: `tests/site-content.test.mjs`
- Test: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: the current `package.json` and old-hosting file layout.
- Produces: two regression tests that define the required native Next.js scripts, dependency set, and removed platform-specific entry points.

- [ ] **Step 1: Add package and filesystem helpers to the test file**

Change the import and add these constants below the existing `layout` constant:

```js
import { access, readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

async function projectPathExists(relativePath) {
  try {
    await access(new URL(`../${relativePath}`, import.meta.url));
    return true;
  } catch {
    return false;
  }
}
```

Keep the existing `assert`, `test`, `page`, `styles`, and `layout` declarations unchanged.

- [ ] **Step 2: Add the failing native build test**

Append:

```js
test("uses native Next.js commands for Vercel", () => {
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.equal(packageJson.scripts["db:generate"], undefined);
});
```

- [ ] **Step 3: Add the failing old-hosting cleanup test**

Append:

```js
test("removes the previous hosting runtime and unused database scaffold", async () => {
  const removedPackages = [
    "drizzle-orm",
    "@cloudflare/vite-plugin",
    "@vitejs/plugin-react",
    "@vitejs/plugin-rsc",
    "drizzle-kit",
    "react-server-dom-webpack",
    "vinext",
    "vite",
    "wrangler",
  ];

  for (const packageName of removedPackages) {
    assert.equal(packageJson.dependencies?.[packageName], undefined);
    assert.equal(packageJson.devDependencies?.[packageName], undefined);
  }

  const removedPaths = [
    ".openai/hosting.json",
    "app/chatgpt-auth.ts",
    "build/sites-vite-plugin.ts",
    "db/index.ts",
    "db/schema.ts",
    "drizzle.config.ts",
    "drizzle/meta/_journal.json",
    "examples/d1/app/api/notes/route.ts",
    "examples/d1/db/schema.ts",
    "vite.config.ts",
    "worker/index.ts",
  ];

  for (const relativePath of removedPaths) {
    assert.equal(
      await projectPathExists(relativePath),
      false,
      `old hosting path still exists: ${relativePath}`,
    );
  }
});
```

- [ ] **Step 4: Run the tests and verify the migration tests fail for the expected reason**

Run:

```powershell
npm.cmd test
```

Expected: the existing 14 tests pass; the two new tests fail because scripts still use `vinext`, the packages are still installed, and the old-hosting files still exist.

- [ ] **Step 5: Commit the red tests**

```powershell
git add tests/site-content.test.mjs
git commit -m "test: define native Vercel migration contract"
```

---

### Task 2: Convert the repository to native Next.js

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`
- Delete: `.openai/hosting.json`
- Delete: `app/chatgpt-auth.ts`
- Delete: `build/sites-vite-plugin.ts`
- Delete: `db/index.ts`
- Delete: `db/schema.ts`
- Delete: `drizzle.config.ts`
- Delete: `drizzle/meta/_journal.json`
- Delete: `examples/d1/app/api/notes/route.ts`
- Delete: `examples/d1/db/schema.ts`
- Delete: `vite.config.ts`
- Delete: `worker/index.ts`
- Test: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: the failing migration contract from Task 1.
- Produces: a Vercel-compatible repository whose only runtime is native Next.js.

- [ ] **Step 1: Replace the package scripts**

Use `apply_patch` so the `scripts` object becomes exactly:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "node --test tests/site-content.test.mjs",
  "lint": "eslint . --ignore-pattern .next"
}
```

- [ ] **Step 2: Remove the unused runtime packages and update the lockfile mechanically**

Run:

```powershell
npm.cmd uninstall drizzle-orm @cloudflare/vite-plugin @vitejs/plugin-react @vitejs/plugin-rsc drizzle-kit react-server-dom-webpack vinext vite wrangler
```

Expected: `package.json` retains `next`, `react`, `react-dom`, Tailwind, TypeScript, ESLint, and React/Node type packages; `package-lock.json` no longer resolves the removed direct dependencies.

- [ ] **Step 3: Delete all old-hosting entry points with `apply_patch`**

Apply this deletion patch:

```text
*** Begin Patch
*** Delete File: .openai/hosting.json
*** Delete File: app/chatgpt-auth.ts
*** Delete File: build/sites-vite-plugin.ts
*** Delete File: db/index.ts
*** Delete File: db/schema.ts
*** Delete File: drizzle.config.ts
*** Delete File: drizzle/meta/_journal.json
*** Delete File: examples/d1/app/api/notes/route.ts
*** Delete File: examples/d1/db/schema.ts
*** Delete File: vite.config.ts
*** Delete File: worker/index.ts
*** End Patch
```

- [ ] **Step 4: Remove obsolete build-output ignores while preserving Vercel privacy**

Use `apply_patch` to change the relevant `.gitignore` sections to:

```gitignore
# next.js
/.next/
/out/

# vercel
/.vercel/
next-env.d.ts
```

Remove `/.vinext/`, `/dist/`, `/.wrangler/`, `/outputs/`, and `/work/`. Leave dependencies, coverage, operating-system files, logs, and `.env*` rules unchanged.

- [ ] **Step 5: Run the focused tests and verify green**

Run:

```powershell
npm.cmd test
```

Expected: 16 tests pass, 0 fail.

- [ ] **Step 6: Commit the native runtime conversion**

```powershell
git add package.json package-lock.json .gitignore tests/site-content.test.mjs
git add -u
git commit -m "build: migrate site to native Next.js"
```

---

### Task 3: Document and verify the native application locally

**Files:**
- Modify: `README.md`
- Verify: `app/page.tsx`
- Verify: `app/layout.tsx`
- Verify: `app/globals.css`
- Verify: `public/media/*`

**Interfaces:**
- Consumes: the native Next.js package and source tree from Task 2.
- Produces: a reproducible local build and accurate maintenance instructions before any Vercel state is created.

- [ ] **Step 1: Replace README with native deployment instructions**

Use `apply_patch` so `README.md` contains:

````markdown
# 张景隆的个人网站

围绕 AI 应用、自动化工作流、Vibe Coding 作品与内容展开的个人网站。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

## 本地运行

```bash
npm install
npm run dev
```

## 检查与构建

```bash
npm test
npm run lint
npm run build
```

## 部署

Vercel 连接 GitHub 仓库 `long32132/personal-website`：

- `main` 分支自动发布到生产环境。
- 其他分支自动生成预览环境。
- 主域名为 `https://zhangjinglongai.com`。
- `www.zhangjinglongai.com` 永久跳转到主域名。

主要内容位于 `app/page.tsx`，视觉样式位于 `app/globals.css`。
````

- [ ] **Step 2: Run the complete local quality gate**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: 16 tests pass, ESLint exits 0, Next.js reports a successful production build, and `git diff --check` emits no errors.

- [ ] **Step 3: Start the production server for a smoke test**

Run the production server on port 4173 from the same validated build:

```powershell
npm.cmd run start -- -p 4173
```

Verify `http://127.0.0.1:4173/` at desktop and 390px mobile widths. Confirm the name, finance screenshot, reminder project, dice project, Xiaohongshu section, workflow, contact links, four mobile navigation items, and no horizontal overflow or console errors.

- [ ] **Step 4: Stop the local server and confirm only intended files changed**

Run:

```powershell
git status --short
```

Expected: only `README.md` is uncommitted; `.next`, `.vercel`, and `next-env.d.ts` do not appear.

- [ ] **Step 5: Commit the documentation**

```powershell
git add README.md
git commit -m "docs: document Vercel deployment workflow"
```

---

### Task 4: Create and verify the isolated Vercel preview

**Files:**
- Local ignored state: `.vercel/project.json`
- No tracked source changes expected.

**Interfaces:**
- Consumes: the verified native Next.js build from Task 3 and the user's Vercel account authenticated through GitHub.
- Produces: a linked Vercel project and a Ready preview deployment that does not receive production-domain traffic.

- [ ] **Step 1: Verify the Vercel CLI and authenticate**

Run:

```powershell
npx.cmd vercel@latest --version
npx.cmd vercel@latest login --github
```

Expected: the CLI prints its version, opens the official GitHub/Vercel authorization flow if needed, and finishes with an authenticated Vercel account. If Vercel presents a GitHub permission or login confirmation, pause for the user to approve that exact Vercel authorization.

- [ ] **Step 2: Create the linked project and preview deployment**

Run:

```powershell
$previewOutput = & npx.cmd vercel@latest deploy --yes --no-color 2>&1
$previewOutput
$previewUrl = ($previewOutput | Where-Object { $_ -match '^https://.+\.vercel\.app$' } | Select-Object -Last 1).Trim()
if (-not $previewUrl) { throw 'Vercel preview URL was not returned.' }
$previewUrl
```

Expected: `.vercel/project.json` is created locally, Vercel detects Next.js, and `$previewUrl` is an HTTPS `vercel.app` URL.

- [ ] **Step 3: Wait for the preview deployment to become Ready**

Run:

```powershell
npx.cmd vercel@latest inspect $previewUrl --wait
```

Expected: deployment status is Ready and the detected framework is Next.js.

- [ ] **Step 4: Perform browser QA on the Vercel preview**

Open `$previewUrl` and repeat the Task 3 desktop/mobile checks. Also verify all three images return successfully, all external links retain their exact URLs, the page title contains `张景隆`, and the browser console has no errors.

- [ ] **Step 5: Confirm Vercel linkage remains untracked**

Run:

```powershell
git status --short
```

Expected: the working tree is clean because `.vercel/` is ignored.

---

### Task 5: Connect GitHub and promote the verified source to production

**Files:**
- No new tracked files.
- External state: GitHub branch, Vercel Git connection, Vercel production deployment.

**Interfaces:**
- Consumes: the Ready preview and clean `codex/vercel-migration` branch from Task 4.
- Produces: GitHub `main` at the verified commit, automatic Vercel deployments, and a Ready production deployment before custom-domain cutover.

- [ ] **Step 1: Push the migration branch to GitHub**

Run:

```powershell
git push -u origin codex/vercel-migration
```

Expected: GitHub creates or updates `codex/vercel-migration` at local `HEAD`.

- [ ] **Step 2: Connect the linked Vercel project to the existing GitHub remote**

Run:

```powershell
npx.cmd vercel@latest git connect --yes
```

Expected: Vercel reports that the linked project is connected to `long32132/personal-website`. In Vercel Project Settings, confirm the Production Branch is `main`.

- [ ] **Step 3: Re-run the source quality gate immediately before production**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git status --short
```

Expected: 16 tests pass, lint and build pass, and the working tree is clean.

- [ ] **Step 4: Fast-forward GitHub main to the verified commit**

Run:

```powershell
git fetch origin main
git merge-base --is-ancestor origin/main HEAD
git push origin HEAD:main
```

Expected: the ancestry check exits 0 and the push updates `origin/main` without force. Never use `--force`.

- [ ] **Step 5: Verify remote source identity**

Run:

```powershell
$localSha = git rev-parse HEAD
$remoteSha = (git ls-remote origin refs/heads/main).Split()[0]
if ($localSha -ne $remoteSha) { throw "GitHub main does not match the verified commit." }
```

Expected: no exception; local `HEAD` and GitHub `main` are identical.

- [ ] **Step 6: Wait for and verify the Git-triggered production deployment**

Open the Vercel project dashboard, go to **Deployments**, select the **Production** deployment whose Git commit equals `$localSha`, and wait until its status is **Ready**. Then open its `vercel.app` URL and repeat the preview smoke test. Do not change Alibaba Cloud DNS until this deployment is Ready.

---

### Task 6: Move the custom domains with zero downtime

**Files:**
- No tracked files.
- External state: Vercel Domains, Alibaba Cloud DNS, public DNS, TLS certificates.

**Interfaces:**
- Consumes: the Ready Git-triggered production deployment from Task 5.
- Produces: the canonical root domain on Vercel, a permanent `www` redirect, active TLS, and preserved old-hosting rollback records.

- [ ] **Step 1: Read the linked Vercel project name**

Run:

```powershell
$vercelProject = (Get-Content -Raw '.vercel/project.json' | ConvertFrom-Json).projectName
if (-not $vercelProject) { throw 'Vercel project name is missing.' }
$vercelProject
```

- [ ] **Step 2: Add both domains to the verified Vercel project**

Run:

```powershell
npx.cmd vercel@latest domains add zhangjinglongai.com $vercelProject
npx.cmd vercel@latest domains add www.zhangjinglongai.com $vercelProject
npx.cmd vercel@latest domains inspect zhangjinglongai.com
npx.cmd vercel@latest domains inspect www.zhangjinglongai.com
```

Expected: Vercel associates both domains with the project and displays the exact Alibaba Cloud A, CNAME, and any ownership-verification TXT records required for this project.

- [ ] **Step 3: Configure the canonical redirect in Vercel**

In Project Settings > Domains, keep `zhangjinglongai.com` assigned to Production. Configure `www.zhangjinglongai.com` to redirect permanently with status 308 to `https://zhangjinglongai.com`, preserving the path.

- [ ] **Step 4: Change only the required Alibaba Cloud DNS records**

In Alibaba Cloud DNS for `zhangjinglongai.com`:

1. Record the current rollback A values `162.159.143.30` and `172.66.3.26` before changing them.
2. Remove the two root `@` A records pointing to those old-hosting addresses.
3. Add the exact root `@` A record shown by `vercel domains inspect zhangjinglongai.com`.
4. Add `www` as a CNAME using the exact target shown by `vercel domains inspect www.zhangjinglongai.com`.
5. Add any Vercel ownership TXT record exactly as displayed.
6. Keep `_openai-site-verification` and `_cf-custom-hostname` TXT records during the seven-day rollback window.
7. Keep the DNS line set to Default and TTL at 10 minutes.

Do not add Vercel's general-purpose example values unless the linked project's inspection output shows the same values.

- [ ] **Step 5: Poll Vercel until both domains and SSL are valid**

Run these commands at intervals no longer than 30 seconds:

```powershell
npx.cmd vercel@latest domains inspect zhangjinglongai.com
npx.cmd vercel@latest domains inspect www.zhangjinglongai.com
npx.cmd vercel@latest certs ls
```

Expected: both domains are configured correctly and their HTTPS certificates are active.

- [ ] **Step 6: Verify public DNS and HTTP behavior**

Run:

```powershell
$rootDns = Invoke-RestMethod -Uri 'https://dns.google/resolve?name=zhangjinglongai.com&type=A'
$wwwDns = Invoke-RestMethod -Uri 'https://dns.google/resolve?name=www.zhangjinglongai.com&type=CNAME'
if ($rootDns.Status -ne 0 -or -not $rootDns.Answer) { throw 'Root A record is not public yet.' }
if ($wwwDns.Status -ne 0 -or -not $wwwDns.Answer) { throw 'www CNAME is not public yet.' }

$rootResponse = Invoke-WebRequest -Uri 'https://zhangjinglongai.com' -UseBasicParsing
if ($rootResponse.StatusCode -ne 200 -or $rootResponse.Content -notmatch '张景隆') {
  throw 'Canonical domain did not return the personal website.'
}

try {
  Invoke-WebRequest -Uri 'https://www.zhangjinglongai.com' -MaximumRedirection 0 -UseBasicParsing
  throw 'www did not redirect.'
} catch {
  $response = $_.Exception.Response
  if ([int]$response.StatusCode -ne 308) { throw }
  if ($response.Headers.Location -notlike 'https://zhangjinglongai.com*') {
    throw 'www redirected to an unexpected destination.'
  }
}
```

Compare `$rootDns.Answer.data` and `$wwwDns.Answer.data` with the exact DNS values captured from Vercel in Step 2. Stop and roll back if either differs. Expected: public DNS matches Vercel's exact A and CNAME values, the canonical domain returns HTTP 200 with the expected content, and `www` returns 308 to the canonical domain.

- [ ] **Step 7: Verify the rollback target remains available**

Run:

```powershell
$rollback = Invoke-WebRequest -Uri 'https://zhangjinglong-ai-works.kariiii1.chatgpt.site' -UseBasicParsing
if ($rollback.StatusCode -ne 200 -or $rollback.Content -notmatch '张景隆') {
  throw 'The seven-day rollback deployment is unavailable.'
}
```

Expected: the old default hosting URL still returns the same website. Do not archive or delete it during the seven-day rollback window.

- [ ] **Step 8: Record final state and handoff**

Report:

- Vercel project name and GitHub connection.
- Production commit SHA.
- Vercel production status.
- Root-domain HTTP/HTTPS result.
- `www` redirect result.
- Old-hosting rollback URL and the date seven days after cutover.
- The two old A values required for rollback: `162.159.143.30` and `172.66.3.26`.
