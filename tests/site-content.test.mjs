import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(
  new URL("../app/page.tsx", import.meta.url),
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
