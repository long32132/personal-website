import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
    "https://github.com/long2132",
    "https://www.xiaohongshu.com/user/profile/5c8e6bd00000000010024796",
    "mailto:956348436@qq.com",
  ];

  for (const link of links) {
    assert.ok(page.includes(link), `missing verified link: ${link}`);
  }
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
});

test("uses honest visuals for every project", () => {
  assert.doesNotMatch(page, /功能结构示意（非产品截图）/);
  assert.match(page, /财务 AI 小助理 · 实际界面/);
  assert.match(page, /\/media\/stand-up-reminder\.ico/);
  assert.match(page, /项目视觉标识/);
});

test("uses the verified 1200 by 630 sharing image", async () => {
  assert.match(layout, /og-portfolio-v2\.png/);
  const png = await readFile(
    new URL("../public/og-portfolio-v2.png", import.meta.url),
  );
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
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
