import { localeOptionsForSanity } from "@brtu/locales";
import { defineField, defineType } from "sanity";

export const resourceCategory = defineType({
  name: "resourceCategory",
  title: "Resource category",
  type: "document",
  fields: [
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      description: "Categories are per locale; link translations via English source.",
      options: {
        list: localeOptionsForSanity(),
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "translationOf",
      title: "English source document",
      description: "For non-English categories, link the English category. Blank for English.",
      type: "reference",
      to: [{ type: "resourceCategory" }],
      options: {
        filter: 'locale == "en"',
      },
      hidden: ({ document }) => document?.locale === "en",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (rule) => rule.required(),
    }),
  ],
});
