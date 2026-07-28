import type { Event, EventPhoto } from "@/types";


export const AACRC_SLUG = "aacrc-05072026";


export const AACRC_EVENT: Event = {
  id: AACRC_SLUG,
  slug: AACRC_SLUG,
  name: "Encontro AACRC",
  city: "Rio Claro/SP",
  date: "05/07/2026",
  photoCount: 157,
  image:  "https://azgbacvirqxppqjbepjq.supabase.co/storage/v1/object/public/thumbnails/aacrc-05072026/0001.jpg",
};


export async function generateAacrcPhotos(): Promise<EventPhoto[]> {
  return [];
}


export const AACRC_PHOTOS: EventPhoto[] = [];