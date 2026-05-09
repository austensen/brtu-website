import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { resolveSanityEnv } from "./client";

export function getSanityImageBuilder() {
  const { projectId, dataset } = resolveSanityEnv();
  if (!projectId || !dataset) {
    throw new Error("Missing PUBLIC_SANITY_PROJECT_ID or PUBLIC_SANITY_DATASET");
  }
  return imageUrlBuilder({ projectId, dataset });
}

export function urlForSanityImage(source: SanityImageSource | undefined | null) {
  if (!source) return null;
  return getSanityImageBuilder().image(source);
}
