import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  fields: [
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Spanish", value: "es" },
          { title: "Arabic", value: "ar" },
          { title: "Chinese (Simplified)", value: "zh" },
        ],
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "translationOf",
      title: "English source document",
      type: "reference",
      to: [{ type: "resource" }],
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
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "resourceCategory" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "file",
      title: "Resource file",
      type: "file",
      options: {
        accept: ".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Last updated",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "externalUrl",
      title: "External URL (for large media/video)",
      type: "url",
      description: "Use this for large hosted media (e.g., YouTube).",
    }),
  ],
});

