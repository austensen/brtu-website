import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
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
      to: [{ type: "event" }],
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
      name: "startDateTime",
      title: "Start date and time",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDateTime",
      title: "End date and time",
      type: "datetime",
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const start = context.document?.startDateTime as string | undefined;
          const end = value as string | undefined;
          if (!start || !value) return true;
          return new Date(end) > new Date(start) ? true : "End must be after start.";
        }),
    }),
    defineField({
      name: "timezone",
      title: "Timezone",
      type: "string",
      initialValue: "America/New_York",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "mapLink",
      title: "Map link",
      type: "url",
    }),
    defineField({
      name: "joinUrl",
      title: "Online meeting URL",
      type: "url",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "richText",
      validation: (rule) => rule.required(),
    }),
  ],
});

