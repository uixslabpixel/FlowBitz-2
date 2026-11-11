import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { COMPONENT_LOADERS, COMPONENT_REQUIREMENTS, VERSION } from "../src/library/loader.js";
import { componentsMetadata } from "../src/library/data/componentsMetadata.js";

const root = path.resolve(import.meta.dirname, "..");
const lib = path.join(root, "src/library");
const metaKeys = Object.keys(componentsMetadata).sort();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

// The path inside each `() => import("./components/…")` loader function.
const loaderPath = (name) =>
  COMPONENT_LOADERS[name].toString().match(/import\(\s*["'](\.\/components\/[^"']+)["']\s*\)/)[1];

test("loader.js has a loader for exactly the components in componentsMetadata.js", () => {
  assert.deepEqual(Object.keys(COMPONENT_LOADERS).sort(), metaKeys);
});

test("loader.js lists GSAP requirements for exactly the same components", () => {
  assert.deepEqual(Object.keys(COMPONENT_REQUIREMENTS).sort(), metaKeys);
});

test("every loader points at a file that exists", () => {
  for (const name of Object.keys(COMPONENT_LOADERS)) {
    assert.ok(fs.existsSync(path.join(lib, loaderPath(name))), `${name}: ${loaderPath(name)} is missing`);
  }
});

test("each metadata `file` matches the file its loader imports", () => {
  for (const name of metaKeys) {
    assert.equal(componentsMetadata[name].file, path.basename(loaderPath(name)), `${name}: metadata file is wrong`);
  }
});

test("card themes and preview videos only name real components", () => {
  const themes = read("src/app/components/redesign/cardThemes.js");
  const body = themes.slice(themes.indexOf("export const cardThemes = {"));
  const themeKeys = [...body.matchAll(/^  "?([a-z0-9-]+)"?: \{/gm)].map((m) => m[1]);
  assert.ok(themeKeys.length > 0, "no card themes parsed");
  const videos = JSON.parse(read("src/app/content/previewVideos.json"));
  for (const id of [...themeKeys, ...videos]) assert.ok(metaKeys.includes(id), `${id} is not a component`);
});

test("the version is the same everywhere", () => {
  const { version } = JSON.parse(read("package.json"));
  assert.equal(VERSION, version, "src/library/loader.js VERSION");
  assert.ok(read("src/library/core/WebflowBits.js").includes(`this.version = '${version}'`), "WebflowBits.js this.version");
  assert.ok(read("README.md").includes(`badge/version-${version}-`), "README.md version badge");
});
