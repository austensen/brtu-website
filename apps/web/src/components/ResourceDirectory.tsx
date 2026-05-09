import { useMemo, useState } from "react";
import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "@brtu/locales";

import styles from "./ResourceDirectory.module.css";

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

  return (
    <>
      <div className={`resource-toolbar ${styles.toolbar}`}>
        <span id="filter-label" className="visually-hidden">
          Filter by category
        </span>
        <div className={styles.filterGroup} role="group" aria-labelledby="filter-label">
          <button
            type="button"
            className={`btn ${styles.filterNeutral}`}
            aria-pressed={selected === ALL}
            onClick={() => setSelected(ALL)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={`btn ${styles.filterNeutral}`}
              aria-pressed={selected === cat.slug}
              onClick={() => setSelected(cat.slug)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      <ul className={`resource-list ${styles.list}`}>
        {visible.map((r) => (
          <li key={r.slug} className={`card resource-item ${styles.listItem}`}>
            <h2 className={styles.title}>
              <a href={withLocalePath(locale, `resources/${r.slug}`)}>{r.title}</a>
            </h2>
            {r.category ? <p className={styles.category}>{r.category.title}</p> : null}
            <p className={styles.summary}>{r.summary}</p>
            <p className={styles.updated}>
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
