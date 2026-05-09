import type { StructureResolver } from "sanity/structure";

const pageTypes = [
  { title: "Home", value: "home" },
  { title: "About", value: "about" },
  { title: "Contact", value: "contact" },
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website content")
    .items([
      S.listItem()
        .title("Site settings")
        .child(
          S.documentTypeList("siteSettings")
            .title("Site settings (per locale)")
            .defaultOrdering([{ field: "locale", direction: "asc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages by type")
            .items(
              pageTypes.map((pt) =>
                S.listItem()
                  .title(`${pt.title} pages`)
                  .child(
                    S.documentList()
                      .title(`${pt.title} pages`)
                      .filter(`_type == "page" && pageType == "${pt.value}"`)
                      .defaultOrdering([{ field: "locale", direction: "asc" }]),
                  ),
              ),
            ),
        ),
      S.divider(),
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("resource").title("Resources"),
      S.documentTypeListItem("event").title("Events"),
      S.divider(),
      S.documentTypeListItem("resourceCategory").title("Resource categories"),
    ]);
