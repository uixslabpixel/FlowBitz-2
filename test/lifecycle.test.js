import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "../src/library/components");
const files = fs
  .readdirSync(dir, { recursive: true })
  .filter((f) => f.endsWith(".js"))
  .map((f) => path.join(dir, f));

test("there are 30 component files", () => {
  assert.equal(files.length, 30);
});

// The loader starts a component with initAll() and stops it with destroyAll().
for (const method of ["initAll", "destroyAll"]) {
  test(`every component defines ${method}()`, () => {
    const missing = files
      .filter((f) => !new RegExp(`^\\s*(async\\s+)?${method}\\(`, "m").test(fs.readFileSync(f, "utf8")))
      .map((f) => path.basename(f));
    assert.deepEqual(missing, []);
  });
}
