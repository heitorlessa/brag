/** Lightweight Markdown → plain-text helpers for list/card previews. */

/** Strip common Markdown syntax to a single-line plain-text string. */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/^[-*+]\s+/gm, "") // bullet markers
    .replace(/^\d+\.\s+/gm, "") // ordered markers
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1") // emphasis
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain-text excerpt of Markdown, truncated with an ellipsis. */
export function markdownExcerpt(markdown: string, max = 160): string {
  const text = markdownToPlainText(markdown);
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
