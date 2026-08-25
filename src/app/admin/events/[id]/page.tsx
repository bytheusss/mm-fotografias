import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import { DuplicateEventButton } from "@/components/admin/DuplicateEventButton";


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

  const [{count:photographerCount},{count:packageCount}]=await Promise.all([
    supabaseAdmin.from("event_photographers").select("*",{count:"exact",head:true}).eq("event_id",id),
    supabaseAdmin.from("event_pricing_packages").select("*",{count:"exact",head:true}).eq("event_id",id).eq("active",true),
  ]);



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
        px-4 sm:px-6
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



          <div className="p-4 sm:p-8">


            <div
              className="
              flex
              flex-col sm:flex-row justify-between
              gap-5
              items-start
              "
            >



              <div>


                <h1
                  className="
                  text-3xl sm:text-4xl break-words
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
                <DuplicateEventButton id={event.id} />


              </div>



            </div>


          </div>



        </section>

        <section className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Checklist de publicação</h2><p className="text-sm text-neutral-400">Confira os itens essenciais antes de divulgar o álbum.</p></div><span className="rounded-full bg-black px-3 py-1 text-sm">{[Boolean(event.cover_image),Boolean(totalPhotos),Boolean(photographerCount),Boolean(event.share_message),Boolean(packageCount||event.base_price)].filter(Boolean).length}/5 prontos</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{[["Capa",Boolean(event.cover_image)],["Fotos",Boolean(totalPhotos)],["Fotógrafo",Boolean(photographerCount)],["WhatsApp",Boolean(event.share_message)],["Preço",Boolean(packageCount||event.base_price)]].map(([label,ready])=><div key={String(label)} className={`rounded-lg border p-3 text-sm font-bold ${ready?"border-green-900 bg-green-950/30 text-green-300":"border-amber-900 bg-amber-950/30 text-amber-300"}`}>{ready?"✓":"!"} {label}</div>)}</div></section>





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
