import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);
const styles = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
const layout = await readFile(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);
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

test("uses the correct name and required sections", () => {
  assert.match(page, /张景隆/);

  for (const id of ["about", "work", "workflow", "contact"]) {
    assert.match(page, new RegExp(`id=["']${id}["']`));
  }
});

test("contains every verified public link", () => {
  const links = [
    "https://long32132.github.io/-2333/",
    "https://github.com/long32132/-2333",
    "https://github.com/long32132/stand-up-reminder",
    "https://www.xiaohongshu.com/user/profile/5c8e6bd00000000010024796",
    "mailto:956348436@qq.com",
  ];

  for (const link of links) {
    assert.ok(page.includes(link), `missing verified link: ${link}`);
  }

  assert.match(page, /href="https:\/\/github\.com\/long32132"/);
  assert.doesNotMatch(page, /long2132/);
});

test("does not contain rejected resume-style claims", () => {
  for (const phrase of [
    "AI Application Specialist",
    "AI Trainer",
    "AI 实验室",
    "教育经历",
    "求职中",
  ]) {
    assert.doesNotMatch(page, new RegExp(phrase));
  }
});

test("keeps every primary navigation item available on mobile", () => {
  assert.doesNotMatch(styles, /nav a:not\(:last-child\)/);
  assert.match(styles, /overflow-x: auto/);
  for (const href of ["#about", "#work", "#workflow", "#contact"]) {
    assert.match(page, new RegExp(`<a href="${href}">`));
  }
  assert.equal(
    (page.match(/<a href="#(?:about|work|workflow|contact)">/g) ?? []).length,
    4,
  );
});

test("uses a readable leaf green for small labels", () => {
  assert.match(styles, /--accent-text: #1d5c34/);
  assert.match(
    styles,
    /\.hero-index,[\s\S]*?\.project-type\s*\{[^}]*color: var\(--accent-text\)/,
  );
  assert.match(
    styles,
    /\.workflow-item span\s*\{[^}]*color: var\(--accent-text\)/,
  );
});

test("places the finance screenshot caption below the image", () => {
  assert.match(
    styles,
    /\.finance-screenshot figcaption\s*\{[^}]*position: static/,
  );
  assert.doesNotMatch(
    styles,
    /\.finance-screenshot figcaption\s*\{[^}]*position: absolute/,
  );
});

test("uses honest visuals for every project", () => {
  assert.doesNotMatch(page, /功能结构示意（非产品截图）/);
  assert.match(page, /财务 AI 小助理 · 实际界面/);
  assert.match(page, /\/media\/stand-up-reminder\.ico/);
  assert.match(page, /项目视觉标识/);
});

function jpegSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("sharing image is not a JPEG");
  }

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      throw new Error("invalid JPEG marker");
    }

    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc2) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }

  throw new Error("JPEG size not found");
}

test("uses the verified 1200 by 630 sharing image", async () => {
  assert.match(layout, /og-portfolio-v2\.jpg/);
  const jpeg = await readFile(
    new URL("../public/og-portfolio-v2.jpg", import.meta.url),
  );
  const { width, height } = jpegSize(jpeg);
  assert.equal(width, 1200);
  assert.equal(height, 630);
  assert.ok(jpeg.length < 200 * 1024, `sharing image is ${jpeg.length} bytes`);
});

test("uses the approved clean hero copy", () => {
  for (const phrase of [
    "张景隆",
    "ZHANG JINGLONG",
    "我用 AI，把想法做成可以使用的东西。",
    "AI 应用 · 自动化工作流 · Vibe Coding · 内容创作",
  ]) {
    assert.match(page, new RegExp(phrase));
  }

  assert.doesNotMatch(page, /你好，我是张景隆/);
  assert.doesNotMatch(page, /Thinking First\. AI Second\./);
  assert.match(page, /className="hero-name"/);
  assert.match(page, /className="about-summary"/);
});

test("uses real imagery and the approved lightweight work layout", async () => {
  assert.match(page, /\/media\/finance-ai-assistant\.png/);
  assert.match(page, /className="featured-project"/);
  assert.match(page, /className="project-pair"/);
  assert.match(page, /className="content-project"/);
  assert.doesNotMatch(page, /finance-preview/);
  assert.doesNotMatch(page, /issue-label/);

  const png = await readFile(
    new URL("../public/media/finance-ai-assistant.png", import.meta.url),
  );
  assert.equal(png.readUInt32BE(16), 1920);
  assert.equal(png.readUInt32BE(20), 879);
});

test("uses the lightweight workflow and contact close", () => {
  assert.match(page, /className="workflow-line"/);
  assert.match(page, /有想法，欢迎和我聊聊。/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /\.project-pair[\s\S]*grid-template-columns: 1fr/);
  assert.doesNotMatch(page, /workflow-card/);
});

test("serves portfolio images without the incompatible image optimizer", () => {
  const imageTags = page.match(/<Image[\s\S]*?\/>/g) ?? [];
  assert.equal(imageTags.length, 3, "expected all three portfolio images");

  for (const tag of imageTags) {
    assert.match(tag, /\bunoptimized\b/);
  }
});

test("keeps secondary project titles balanced inside the two-column layout", () => {
  assert.match(
    styles,
    /\.simple-project h3\s*\{[\s\S]*?font-size: clamp\(28px, 2\.4vw, 40px\)/,
  );
});

test("balances large section headings on narrow screens", () => {
  assert.match(
    styles,
    /\.section-intro h2\s*\{[^}]*text-wrap: balance/,
  );
});

test("uses native Next.js commands for Vercel", () => {
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.equal(packageJson.scripts["db:generate"], undefined);
});

test("keeps the meadow scene generated, readable, and optional", async () => {
  assert.equal(packageJson.dependencies.three, "0.170.0");
  assert.match(page, /白天/);
  assert.match(page, /夜晚/);
  assert.match(page, /看风景/);
  assert.match(page, /data-meadow="day"/);
  assert.match(page, /data-meadow="night"/);
  assert.match(page, /data-meadow="hide"/);
  assert.match(styles, /\.hero-name\s*\{[^}]*font-size: 22px/);
  assert.match(styles, /meadow-poster/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.doesNotMatch(styles, /\.hero-name\s*\{[^}]*font-size: clamp\(8\dpx/);

  const meadow = await readFile(new URL("../app/meadow/meadow.ts", import.meta.url), "utf8");
  const canvas = await readFile(new URL("../app/meadow/meadow-canvas.tsx", import.meta.url), "utf8");
  assert.match(meadow, /meadowHeight/);
  assert.match(canvas, /prefers-reduced-motion/);
  assert.doesNotMatch(meadow, /https?:\/\//);
  assert.doesNotMatch(meadow, /touch grass/i);
});

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
