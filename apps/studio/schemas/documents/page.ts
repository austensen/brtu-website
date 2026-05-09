import { localeOptionsForSanity } from "@brtu/locales";
import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      description: "Language for this page. Create one document per locale.",
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
        "For non-English pages, link the published English page this translation replaces. Leave blank for English.",
      type: "reference",
      to: [{ type: "page" }],
      options: {
        filter: 'locale == "en"',
      },
      hidden: ({ document }) => document?.locale === "en",
    }),
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "About", value: "about" },
          { title: "Contact", value: "contact" },
        ],
      },
      validation: (rule) => rule.required(),
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
      description:
        "URL segment for About and Contact (e.g. about, contact). Home uses the locale root only — /en/, /es/, etc. — so no slug is needed.",
      type: "slug",
      options: {
        source: "title",
      },
      hidden: ({ document }) => document?.pageType === "home",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.pageType === "home") return true;
          if (!value?.current?.trim()) {
            return "Slug is required for About and Contact pages.";
          }
          return true;
        }),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "richText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      hidden: ({ document }) => document?.pageType !== "contact",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.pageType === "contact" && !value) {
            return "Contact pages require a contact email.";
          }
          return true;
        }),
    }),
    defineField({
      name: "contactForm",
      title: "Contact form labels and messages",
      description:
        "All visitor-visible form copy must live here so it can be translated per locale (Netlify Forms).",
      type: "contactFormConfig",
      hidden: ({ document }) => document?.pageType !== "contact",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.pageType === "contact" && !value) {
            return "Contact pages require Netlify form content fields.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "locale",
      pageType: "pageType",
    },
    prepare(selection) {
      const { title, subtitle, pageType } = selection;
      return {
        title,
        subtitle: `${pageType ?? "page"} | ${subtitle ?? "en"}`,
      };
    },
  },
});
