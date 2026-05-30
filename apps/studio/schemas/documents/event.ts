import { localeOptionsForSanity } from "@brtu/locales";
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
      description: "Language for this event. One document per locale.",
      options: {
        list: localeOptionsForSanity(),
      },
      initialValue: "en",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "translationOf",
      title: "English source document",
      description: "For translations, link the published English event. Blank for English.",
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
      name: "promotionalFlyer",
      title: "Promotional flyer",
      type: "file",
      description:
        "Optional image or PDF shown only on the event detail page (not the events list).",
      options: {
        accept: ".pdf,.jpg,.jpeg,.png,.webp",
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "richText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "membersOnly",
      title: "Members only",
      type: "boolean",
      description:
        "When on, this event is hidden from public lists and detail until a member is logged in. Set the same on each translated event so behavior matches.",
      initialValue: false,
    }),
    defineField({
      name: "airtableFormUrl",
      title: "AirTable form URL",
      type: "url",
      description:
        "The URL of the AirTable form to embed on the event detail page. The following search params are added for prefilled values: `?prefill_Event=<event_slug>&hide_Event=true`.",
    }),
  ],
});
