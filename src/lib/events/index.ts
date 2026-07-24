import {
  AACRC_EVENT,
  AACRC_PHOTOS,
  AACRC_SLUG,
} from "@/lib/events/aacrc-05072026";
import type { Event, EventPhoto } from "@/types";

const EVENTS: Event[] = [AACRC_EVENT];

const PHOTOS_BY_SLUG: Record<string, EventPhoto[]> = {
  [AACRC_SLUG]: AACRC_PHOTOS,
};

export function getAllEvents(): Event[] {
  return EVENTS;
}

export function getEventBySlug(slug: string): Event | undefined {
  return EVENTS.find((event) => event.slug === slug);
}

export function getEventPhotos(slug: string): EventPhoto[] {
  return PHOTOS_BY_SLUG[slug] ?? [];
}

export function getEventPhoto(
  slug: string,
  numero: string
): EventPhoto | undefined {
  return getEventPhotos(slug).find((photo) => photo.numero === numero);
}

export function getFeaturedPhotos(limit = 6): EventPhoto[] {
  return AACRC_PHOTOS.slice(0, limit);
}

export { AACRC_EVENT, AACRC_PHOTOS, AACRC_SLUG };
