import { CheckmarkCircleIcon } from "@sanity/icons";
import { Stack, Text } from "@sanity/ui";
import type { DocumentActionComponent } from "sanity";

function checklistForType(schemaType: string): string[] {
  const common = [
    "Locale matches the audience for this document.",
    'Non-English documents: set "English source document" to the matching published English entry.',
  ];
  switch (schemaType) {
    case "page":
      return [
        "Home: lives at /[locale]/ only (no slug in Studio). About/Contact: title and slug match the public URL.",
        "Contact pages: confirm email and Netlify form labels/messages are complete.",
        ...common,
      ];
    case "post":
      return [
        "Hero image has meaningful alt text (when you add images in the editor).",
        "Slug is unique for this locale.",
        ...common,
      ];
    case "resource":
      return [
        "File attachment is present and opens correctly.",
        "Category is set for this locale.",
        ...common,
      ];
    case "event":
      return [
        "Start and end times, timezone, and location look correct.",
        "Slug is unique for this locale.",
        ...common,
      ];
    case "resourceCategory":
      return ["Title and slug are set.", ...common];
    case "siteSettings":
      return ["Organization name and short description are up to date.", ...common];
    default:
      return common;
  }
}

export const editorChecklistAction: DocumentActionComponent = (props) => {
  const { onComplete, type: schemaType } = props;
  const items = checklistForType(schemaType);

  return {
    label: "Editor checklist",
    icon: CheckmarkCircleIcon,
    dialog: {
      type: "dialog",
      header: "Before you publish",
      content: (
        <Stack padding={4} space={3}>
          <Text muted size={1}>
            This is a reminder only — it does not block publishing.
          </Text>
          {items.map((line) => (
            <Text key={line} size={1}>
              • {line}
            </Text>
          ))}
        </Stack>
      ),
      onClose: onComplete,
    },
  };
};
