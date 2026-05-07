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
      type: "slug",
      options: {
        source: "title",
      },
      validation: (rule) => rule.required(),
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

