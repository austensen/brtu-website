/** Strip Portable Text to plain string for calendar descriptions. */
export function portableTextToPlain(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  const parts: string[] = [];
  for (const block of blocks) {
    const b = block as { _type?: string; children?: Array<{ text?: string }> };
    if (b?._type === "block" && Array.isArray(b.children)) {
      for (const c of b.children) {
        if (c?.text) parts.push(c.text);
      }
      parts.push("\n");
    }
  }
  return parts.join("").trim();
}
