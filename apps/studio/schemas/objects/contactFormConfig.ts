import { defineField, defineType } from "sanity";

export const contactFormConfig = defineType({
  name: "contactFormConfig",
  title: "Netlify form content",
  type: "object",
  fields: [
    defineField({
      name: "formName",
      title: "Form name",
      type: "string",
      initialValue: "contact",
      validation: (rule) => rule.required(),
      description: "Used for Netlify form handling (name attribute).",
    }),
    defineField({
      name: "nameLabel",
      title: "Name label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "emailLabel",
      title: "Email label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "messageLabel",
      title: "Message label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "submitLabel",
      title: "Submit button label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "errorMessage",
      title: "Error message",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
});

