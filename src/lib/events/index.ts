import { cache } from "react";
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Event, EventPhoto } from "@/types";


const fallbackEvents: Event[] = [
    {
      id: "aacrc-05072026",
      slug: "aacrc-05072026",
      name: "Encontro AACRC",
      city: "Rio Claro/SP",
      date: "05/07/2026",
      photoCount: 157,
      image:
        "https://azgbacvirqxppqjbepjq.supabase.co/storage/v1/object/public/thumbnails/aacrc-05072026/0001.jpg",
    },
  ];

export const getAllEvents = cache(async (): Promise<Event[]> => {
  const { data } = await supabaseAdmin.from("events").select("id,slug,name,city,event_date,total_photos,cover_image,published,archived,share_message,base_price,access_mode,sales_paused,publish_at,unpublish_at,access_expires_at,password_version").eq("published", true).eq("archived", false).eq("access_mode", "public").order("event_date", { ascending: false });
  const now = Date.now(); const visible = data?.filter(event => (!event.publish_at || new Date(event.publish_at).getTime() <= now) && (!event.unpublish_at || new Date(event.unpublish_at).getTime() > now) && (!event.access_expires_at || new Date(event.access_expires_at).getTime() > now));
  return visible?.length ? visible.map(event => ({ id: event.id, slug: event.slug, name: event.name, city: event.city, date: new Date(event.event_date).toLocaleDateString("pt-BR"), photoCount: event.total_photos || 0, image: event.cover_image, shareMessage: event.share_message, basePrice: Number(event.base_price), accessMode: event.access_mode, salesPaused: event.sales_paused, passwordVersion: Number(event.password_version || 1) })) : fallbackEvents;
});



export const getEventBySlug = cache(async (
  slug: string
): Promise<Event | undefined> => {

  const { data: event } = await supabaseAdmin.from("events").select("id,slug,name,city,event_date,total_photos,cover_image,share_message,base_price,access_mode,sales_paused,publish_at,unpublish_at,access_expires_at,password_version").eq("slug", slug).eq("published", true).eq("archived", false).maybeSingle();
  const now = Date.now(); if (!event || (event.publish_at && new Date(event.publish_at).getTime() > now) || (event.unpublish_at && new Date(event.unpublish_at).getTime() <= now) || (event.access_expires_at && new Date(event.access_expires_at).getTime() <= now)) return undefined;
  return { id: event.id, slug: event.slug, name: event.name, city: event.city, date: new Date(event.event_date).toLocaleDateString("pt-BR"), photoCount: event.total_photos || 0, image: event.cover_image, shareMessage: event.share_message, basePrice: Number(event.base_price), accessMode: event.access_mode, salesPaused: event.sales_paused, passwordVersion: Number(event.password_version || 1) };

});




export const getEventPhotos = cache(
  async (
    slug: string
  ): Promise<EventPhoto[]> => {


    const event = await getEventBySlug(slug);
    if (!event) return [];
    const supabase = await createClient();
    const { data: files, error } = await supabaseAdmin.from("photos").select("id,number,price,status,thumbnail_path,photographer_id,profiles!photos_photographer_id_fkey(full_name)").eq("event_id", event.id).is("deleted_at", null).order("number", { ascending: true });



    if (error) {

      console.error(
        "ERRO SUPABASE STORAGE:",
        error
      );

      return [];

    }



    if (!files || files.length === 0) {

      console.log(
        "NENHUMA FOTO ENCONTRADA:",
        slug
      );

      return [];

    }





    return files

      .filter(
        file =>
          file.status === "available"
      )


      .map(
        file => {


          const numero = String(file.number).padStart(4, "0");



          const imagem =
            supabase.storage
              .from("thumbnails")
              .getPublicUrl(
                String(file.thumbnail_path).replace(/^thumbnails\//, "")
              )
              .data
              .publicUrl;




          return {

            id:
              file.id,
            eventId: event.id,


            numero,


            evento:
              event.name,


            slug,


            imagem,


            thumbnail:
              imagem,


            preco:
              Number(file.price || event.basePrice || 15),


            status:
              "available",
            salesPaused: event.salesPaused,
            photographerId: file.photographer_id,
            photographerName: Array.isArray(file.profiles) ? file.profiles[0]?.full_name : (file.profiles as { full_name?: string } | null)?.full_name || null,


          } as EventPhoto;


        }
      );


  }
);






export const getEventPhoto = cache(
  async (
    slug: string,
    numero: string
  ): Promise<EventPhoto | undefined> => {


    const photos =
      await getEventPhotos(slug);



    return photos.find(
      photo =>
        photo.numero === numero
    );


  }
);






export async function getFeaturedPhotos(
  limit = 6
): Promise<EventPhoto[]> {
  const events = await getAllEvents();
  const featured: EventPhoto[] = [];

  for (const event of events.slice(0, 5)) {
    const photos = await getEventPhotos(event.slug);
    featured.push(...photos.slice(0, Math.max(0, limit - featured.length)));
    if (featured.length >= limit) break;
  }

  return featured;

}
