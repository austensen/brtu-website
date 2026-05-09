import { defineField, defineType } from "sanity";

/** Nested form fields must not block Home/About when `contactForm` is stale or partial. */
function requiredOnContactPage(message: string) {
  return (rule: import("sanity").Rule) =>
    rule.custom<string | undefined>((value, context) => {
      if (context.document?.pageType !== "contact") return true;
      if (value === undefined || value === null || String(value).trim() === "") {
        return message;
      }
      return true;
    });
}

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
      validation: requiredOnContactPage("Form name is required on Contact pages."),
      description: "Used for Netlify form handling (name attribute).",
    }),
    defineField({
      name: "nameLabel",
      title: "Name label",
      type: "string",
      validation: requiredOnContactPage("Name label is required on Contact pages."),
    }),
    defineField({
      name: "emailLabel",
      title: "Email label",
      type: "string",
      validation: requiredOnContactPage("Email label is required on Contact pages."),
    }),
    defineField({
      name: "messageLabel",
      title: "Message label",
      type: "string",
      validation: requiredOnContactPage("Message label is required on Contact pages."),
    }),
    defineField({
      name: "submitLabel",
      title: "Submit button label",
      type: "string",
      validation: requiredOnContactPage("Submit label is required on Contact pages."),
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      type: "text",
      rows: 3,
      validation: requiredOnContactPage("Success message is required on Contact pages."),
    }),
    defineField({
      name: "errorMessage",
      title: "Error message",
      type: "text",
      rows: 3,
      validation: requiredOnContactPage("Error message is required on Contact pages."),
    }),
  ],
});
