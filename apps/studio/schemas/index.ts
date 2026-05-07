import type { SchemaTypeDefinition } from "sanity";
import { event } from "./documents/event";
import { page } from "./documents/page";
import { post } from "./documents/post";
import { resource } from "./documents/resource";
import { resourceCategory } from "./documents/resourceCategory";
import { siteSettings } from "./documents/siteSettings";
import { contactFormConfig } from "./objects/contactFormConfig";
import { richText } from "./objects/richText";

export const schemaTypes: SchemaTypeDefinition[] = [
  richText,
  contactFormConfig,
  siteSettings,
  page,
  post,
  resourceCategory,
  resource,
  event,
];
