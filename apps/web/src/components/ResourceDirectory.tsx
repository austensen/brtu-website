import { useMemo, useState, type CSSProperties } from "react";
import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "@brtu/locales";

export type ResourceDirectoryCategory = {
  slug: string;
  title: string;
};

export type ResourceDirectoryResource = {
  title: string;
  slug: string;
  summary: string;
  updatedAt: string;
  category: ResourceDirectoryCategory | null;
};

type Props = {
  locale: SupportedLocale;
  categories: ResourceDirectoryCategory[];
  resources: ResourceDirectoryResource[];
};

const ALL = "__all__";

export default function ResourceDirectory({ locale, categories, resources }: Props) {
  const [selected, setSelected] = useState<string>(ALL);

  const visible = useMemo(() => {
    if (selected === ALL) return resources;
    return resources.filter((r) => r.category?.slug === selected);
  }, [resources, selected]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );

  const buttonStyle: CSSProperties = {
    border: "2px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
  };

  return (
    <>
      <div className="resource-toolbar" style={{ margin: "var(--space-6) 0" }}>
        <span id="filter-label" className="visually-hidden">
          Filter by category
        </span>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}
          role="group"
          aria-labelledby="filter-label"
        >
          <button
            type="button"
            className="btn btn--primary"
            aria-pressed={selected === ALL}
            style={buttonStyle}
            onClick={() => setSelected(ALL)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className="btn btn--primary"
              aria-pressed={selected === cat.slug}
              style={buttonStyle}
              onClick={() => setSelected(cat.slug)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      <ul className="resource-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {visible.map((r) => (
          <li
            key={r.slug}
            className="card resource-item"
            style={{ marginBottom: "var(--space-4)" }}
          >
            <h2 style={{ margin: "0 0 var(--space-2)", fontSize: "1.15rem" }}>
              <a href={withLocalePath(locale, `resources/${r.slug}`)}>{r.title}</a>
            </h2>
            {r.category ? (
              <p
                style={{
                  margin: "0 0 var(--space-2)",
                  fontSize: "0.9rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {r.category.title}
              </p>
            ) : null}
            <p style={{ margin: "0 0 var(--space-2)" }}>{r.summary}</p>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
              Updated{" "}
              <time dateTime={r.updatedAt}>
                {dateFormatter.format(new Date(r.updatedAt))}
              </time>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
