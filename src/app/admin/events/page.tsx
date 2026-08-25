import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ArchiveEventButton } from "@/components/admin/ArchiveEventButton";


export default async function EventsAdminPage(){


  const { data: events, error } =
    await supabaseAdmin
      .from("events")
      .select("*")
      .order(
        "event_date",
        {
          ascending:false
        }
      );


  if(error){
    console.error(error);
  }



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


        <div
          className="
            flex
            flex-wrap justify-between
            items-center gap-4
            mb-10
          "
        >

          <h1
            className="
              text-3xl sm:text-4xl
              font-bold
            "
          >
            Eventos
          </h1>


          <a
            href="/admin/events/new"
            className="
              bg-red-600
              hover:bg-red-700
              px-5
              py-3
              rounded-lg
              font-bold
            "
          >
            + Novo evento
          </a>


        </div>





        <div className="grid gap-6">


          {
            events?.map(
              (event:any)=>(


                <div
                  key={event.id}
                  className="
                    bg-neutral-900
                    border
                    border-neutral-800
                    rounded-xl
                    p-4 sm:p-6
                    flex
                    flex-col sm:flex-row justify-between
                    items-stretch sm:items-center gap-5
                  "
                >



                  <div
                    className="
                      flex
                      gap-3 sm:gap-5
                      items-center
                      min-w-0
                    "
                  >



                    <img
                      src={event.cover_image}
                      alt={event.name}
                      className="
                        w-20 h-20 sm:w-28 sm:h-28 shrink-0
                        object-cover
                        rounded-xl
                      "
                    />



                    <div className="min-w-0">


                      <h2
                        className="
                          text-xl sm:text-2xl break-words
                          font-bold
                        "
                      >
                        {event.name}
                      </h2>


                      <p
                        className="
                          text-neutral-400
                        "
                      >
                        📍 {event.city}
                      </p>


                      <p
                        className="
                          text-neutral-400
                        "
                      >
                        📸 {event.total_photos || 0} fotos
                      </p>



                      <p className="mt-2">

                        {
                          event.published
                          ?
                          "🟢 Publicado"
                          :
                          "🔴 Rascunho"
                        }

                      </p>

                      {event.archived && <p className="mt-2 text-amber-400">Arquivado</p>}


                    </div>


                  </div>






                  <div
                    className="
                      flex flex-wrap
                      gap-3
                    "
                  >

                    <ArchiveEventButton id={event.id} archived={Boolean(event.archived)} />


                    <a
                      href={`/eventos/${event.slug}`}
                      target="_blank"
                      className="
                        bg-neutral-700
                        hover:bg-neutral-600
                        px-4 sm:px-5
                        py-3
                        rounded-lg
                        font-bold
                      "
                    >
                      Ver página
                    </a>




                    <a
                      href={`/admin/events/${event.id}`}
                      className="
                        bg-red-600
                        hover:bg-red-700
                        px-4 sm:px-5
                        py-3
                        rounded-lg
                        font-bold
                      "
                    >
                      Gerenciar
                    </a>



                  </div>




                </div>


              )
            )
          }


        </div>



      </div>


    </main>

  );

}
