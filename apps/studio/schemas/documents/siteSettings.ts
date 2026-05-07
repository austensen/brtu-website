import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
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
      to: [{ type: "siteSettings" }],
      options: {
        filter: 'locale == "en"',
      },
      hidden: ({ document }) => document?.locale === "en",
    }),
    defineField({
      name: "organizationName",
      title: "Organization name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "defaultLocale",
      title: "Default locale",
      type: "string",
      options: {
        list: [{ title: "English", value: "en" }],
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string", validation: (rule) => rule.required() },
            { name: "url", title: "URL", type: "url", validation: (rule) => rule.required() },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "organizationName",
      subtitle: "locale",
    },
  },
});

