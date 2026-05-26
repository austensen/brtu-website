import { localeOptionsForSanity } from "@brtu/locales";
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
      description: "One site settings document per locale.",
      options: {
        list: localeOptionsForSanity(),
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "translationOf",
      title: "English source document",
      description:
        "For non-English settings, link the English settings document. Blank for English.",
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
        list: localeOptionsForSanity(),
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
            {
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            },
            { name: "url", title: "URL", type: "url", validation: (rule) => rule.required() },
          ],
        },
      ],
    }),
    defineField({
      name: "membersLoginHelp",
      title: "Members login help",
      type: "text",
      rows: 4,
      description:
        "Shown on the public Members login page for this locale (e.g. how to get the password or who to contact). Plain text only.",
    }),
    defineField({
      name: "airTableFormUrl",
      title: "AirTable form URL",
      type: "url",
      description: "The URL of the AirTable form to embed on the Members page.",
    }),
  ],
  preview: {
    select: {
      title: "organizationName",
      subtitle: "locale",
    },
  },
});
