import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";


export default async function EventAdminPage({
  params,
}: {
  params: Promise<{
    id:string;
  }>;
}) {


  const { id } = await params;



  const { data:event, error } =
    await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", id)
      .single();



  if(error || !event){
    notFound();
  }



  const { count:totalPhotos } =
    await supabaseAdmin
      .from("photos")
      .select("*",{
        count:"exact",
        head:true
      })
      .eq("event_id", id);



  const { count:availablePhotos } =
    await supabaseAdmin
      .from("photos")
      .select("*",{
        count:"exact",
        head:true
      })
      .eq("event_id",id)
      .eq("status","available");



  const { count:soldPhotos } =
    await supabaseAdmin
      .from("photos")
      .select("*",{
        count:"exact",
        head:true
      })
      .eq("event_id",id)
      .eq("status","sold");



  const { data:photos } =
    await supabaseAdmin
      .from("photos")
      .select("*")
      .eq("event_id",id)
      .order("number",{
        ascending:true
      })
      .limit(8);



  const revenue =
    (soldPhotos || 0) * 15;



  return (

    <main
      className="
      min-h-screen
      bg-black
      text-white
      pt-32
      pb-20
      "
    >


      <div
        className="
        max-w-6xl
        mx-auto
        px-6
        "
      >



        <section
          className="
          bg-neutral-900
          border
          border-neutral-800
          rounded-xl
          overflow-hidden
          mb-8
          "
        >


          <img
            src={event.cover_image}
            alt={event.name}
            className="
            w-full
            h-72
            object-cover
            "
          />



          <div className="p-8">


            <div
              className="
              flex
              justify-between
              gap-5
              items-start
              "
            >



              <div>


                <h1
                  className="
                  text-4xl
                  font-bold
                  "
                >
                  {event.name}
                </h1>


                <p className="text-neutral-400 mt-3">
                  📍 {event.city}
                </p>


                <p className="text-neutral-400">
                  📅 {event.event_date}
                </p>


                <p className="mt-3">
                  {
                    event.published
                    ?
                    "🟢 Publicado"
                    :
                    "🔴 Rascunho"
                  }
                </p>


              </div>




              <div
                className="
                flex
                flex-wrap
                gap-3
                "
              >


                <a
                  href={`/eventos/${event.slug}`}
                  target="_blank"
                  className="
                  bg-neutral-700
                  px-5
                  py-3
                  rounded-lg
                  font-bold
                  "
                >
                  Ver página
                </a>



                <a
                  href={`/admin/upload?event=${event.id}`}
                  className="
                  bg-red-600
                  px-5
                  py-3
                  rounded-lg
                  font-bold
                  "
                >
                  Upload
                </a>



                <a
                  href={`/admin/events/${event.id}/edit`}
                  className="
                  bg-blue-600
                  px-5
                  py-3
                  rounded-lg
                  font-bold
                  "
                >
                  Editar
                </a>


              </div>



            </div>


          </div>



        </section>





        <section
          className="
          grid
          md:grid-cols-4
          gap-5
          mb-10
          "
        >


          <Stat
            title="Fotos"
            value={totalPhotos || 0}
          />


          <Stat
            title="Disponíveis"
            value={availablePhotos || 0}
          />


          <Stat
            title="Vendidas"
            value={soldPhotos || 0}
          />


          <Stat
            title="Faturamento"
            value={`R$ ${revenue},00`}
          />


        </section>





        <section>


          <div
            className="
            flex
            justify-between
            items-center
            mb-5
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              "
            >
              Fotos
            </h2>


            <a
              href={`/admin/events/${event.id}/photos`}
              className="
              text-red-500
              font-bold
              "
            >
              Gerenciar fotos →
            </a>


          </div>





          <div
            className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-5
            "
          >


            {
              photos?.map(
                (photo:any)=>(


                  <div
                    key={photo.id}
                    className="
                    bg-neutral-900
                    rounded-xl
                    overflow-hidden
                    border
                    border-neutral-800
                    "
                  >


                    <img
                      src={
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.thumbnail_path}`
                      }
                      alt={photo.title}
                      className="
                      aspect-square
                      object-cover
                      w-full
                      "
                    />


                    <div className="p-3">


                      <p className="font-bold">
                        #{String(photo.number).padStart(4,"0")}
                      </p>


                      <p className="text-neutral-400">
                        {photo.status}
                      </p>


                    </div>


                  </div>


                )
              )
            }


          </div>


        </section>




      </div>


    </main>

  );

}




function Stat({
  title,
  value
}:{
  title:string;
  value:string|number;
}){


  return (

    <div
      className="
      bg-neutral-900
      border
      border-neutral-800
      rounded-xl
      p-6
      "
    >

      <p className="text-neutral-400">
        {title}
      </p>


      <p className="
      text-3xl
      font-bold
      mt-2
      ">
        {value}
      </p>


    </div>

  );

}