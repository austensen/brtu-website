import { toHTML } from "@portabletext/to-html";
import type { PortableTextBlock } from "@portabletext/types";
import { urlForSanityImage } from "./image";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function richTextToHtml(blocks: PortableTextBlock[] | null | undefined): string {
  if (!blocks?.length) return "";
  return toHTML(blocks, {
    components: {
      types: {
        image: ({ value }) => {
          const built = value?.asset ? urlForSanityImage(value)?.width(1200).url() : null;
          const alt = escapeHtml((value?.alt as string) ?? "");
          return built
            ? `<figure class="prose-figure"><img src="${escapeHtml(built)}" alt="${alt}" loading="lazy" decoding="async" /></figure>`
            : "";
        },
      },
      marks: {
        link: ({ children, value }) => {
          const href = escapeHtml((value?.href as string) ?? "#");
          return `<a href="${href}">${children}</a>`;
        },
      },
    },
  });
}
