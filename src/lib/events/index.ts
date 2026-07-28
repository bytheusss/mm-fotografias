import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Event, EventPhoto } from "@/types";


export const getAllEvents = (): Event[] => {
  return [
    {
      id: "aacrc-05072026",
      slug: "aacrc-05072026",
      name: "Encontro AACRC",
      city: "Rio Claro/SP",
      date: "05/07/2026",
      photoCount: 157,
      image: "/images/banner/hero.jpg",
    },
  ];
};



export const getEventBySlug = (
  slug: string
): Event | undefined => {

  return getAllEvents().find(
    event => event.slug === slug
  );

};



export const getEventPhotos = cache(
  async (
    slug: string
  ): Promise<EventPhoto[]> => {

    const supabase = createClient();


    const { data: files, error } =
      await supabase.storage
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
        "Erro Supabase:",
        error
      );

      return [];
    }



    if (!files) {
      return [];
    }



    return files
      .filter(
        file =>
          file.name.endsWith(".jpg")
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
              .data.publicUrl;



          return {

            id:
              `${slug}-${numero}`,

            numero,

            evento:
              "Encontro AACRC",

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
  async(
    slug:string,
    numero:string
  ):Promise<EventPhoto | undefined>=>{


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
):Promise<EventPhoto[]>{


  const photos =
    await getEventPhotos(
      "aacrc-05072026"
    );



  return photos.slice(
    0,
    limit
  );

}