import { describe, expect, it } from "vitest";
import { markdownExcerpt, markdownToPlainText } from "../app/utils/markdown";

describe("markdownToPlainText", () => {
  it("strips headings, emphasis and list markers", () => {
    const input = "# Title\n\n- **bold** item\n- _italic_ item";
    expect(markdownToPlainText(input)).toBe("Title bold item italic item");
  });

  it("keeps link text and drops the URL", () => {
    expect(markdownToPlainText("See [the docs](https://x.com)")).toBe(
      "See the docs"
    );
  });
});

describe("markdownExcerpt", () => {
  it("truncates long text with an ellipsis", () => {
    const excerpt = markdownExcerpt("word ".repeat(100), 20);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(21);
  });

  it("leaves short text untouched", () => {
    expect(markdownExcerpt("short note")).toBe("short note");
  });
});
