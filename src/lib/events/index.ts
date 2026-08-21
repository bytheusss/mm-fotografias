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
  const { data } = await supabaseAdmin.from("events").select("id,slug,name,city,event_date,total_photos,cover_image,published,archived,share_message").eq("published", true).eq("archived", false).order("event_date", { ascending: false });
  return data?.length ? data.map(event => ({ id: event.id, slug: event.slug, name: event.name, city: event.city, date: new Date(event.event_date).toLocaleDateString("pt-BR"), photoCount: event.total_photos || 0, image: event.cover_image, shareMessage: event.share_message })) : fallbackEvents;
});



export const getEventBySlug = cache(async (
  slug: string
): Promise<Event | undefined> => {

  return (await getAllEvents()).find(
    event => event.slug === slug
  );

});




export const getEventPhotos = cache(
  async (
    slug: string
  ): Promise<EventPhoto[]> => {


    const supabase = await createClient();



    const event = await getEventBySlug(slug);



    const {
      data: files,
      error
    } = await supabase.storage
      .from("thumbnails")
      .list(slug, {
        limit: 1000,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });



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
          file.name.toLowerCase().endsWith(".jpg")
      )


      .map(
        file => {


          const numero =
            file.name.replace(".jpg", "");



          const imagem =
            supabase.storage
              .from("thumbnails")
              .getPublicUrl(
                `${slug}/${file.name}`
              )
              .data
              .publicUrl;




          return {

            id:
              `${slug}-${numero}`,


            numero,


            evento:
              event?.name || slug,


            slug,


            imagem,


            thumbnail:
              imagem,


            preco:
              15,


            status:
              "available",


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


  const photos =
    await getEventPhotos(
      "aacrc-05072026"
    );



  return photos.slice(
    0,
    limit
  );

}
