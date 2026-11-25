// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Catches text that was saved in the wrong encoding, e.g. "â€¦" instead of "…"
// or "â€º" instead of "›" - which show up on screen as garbled characters.
const SRC = fileURLToPath(new URL("..", import.meta.url));
const MOJIBAKE = /[\u00c2\u00c3\u00e2][\u0080-\u00bf\u00c0-\u00ff\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u203a\u20ac\u2122]+/;

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "__tests__" || name === "assets" ? [] : sourceFiles(path);
    const isSource = /\.(jsx?|css|html)$/.test(name) && !/backup|\.bak/i.test(name);
    return isSource ? [path] : [];
  });
}

describe("source files are clean UTF-8", () => {
  const files = sourceFiles(SRC);

  it("finds the source files", () => expect(files.length).toBeGreaterThan(20));

  it.each(files.map((file) => [file.slice(SRC.length)]))("%s has no invalid or garbled characters", (name) => {
    const bytes = readFileSync(join(SRC, name));
    let text;
    expect(() => {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }, `${name} is not valid UTF-8`).not.toThrow();
    const match = text.match(MOJIBAKE);
    expect(match ? match[0] : null, `${name} contains garbled text`).toBeNull();
  });
});
