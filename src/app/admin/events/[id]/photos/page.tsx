import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import DeletePhotoButton from "@/components/DeletePhotoButton";
import { createOriginalDownloadUrl } from "@/lib/original-storage";


export default async function EventPhotosPage({
  params,
}: {
  params: Promise<{
    id:string;
  }>;
}) {


  const { id } = await params;



  const { data:event, error:eventError } =
    await supabaseAdmin
      .from("events")
      .select("*")
      .eq(
        "id",
        id
      )
      .single();



  if(eventError || !event){
    notFound();
  }





  const { data:photos, error } =
    await supabaseAdmin
      .from("photos")
      .select("*")
      .eq(
        "event_id",
        id
      )
      .is("deleted_at", null)
      .order(
        "number",
        {
          ascending:true
        }
      );



  if(error){
    console.error(error);
  }

  const photosWithUrls = await Promise.all((photos || []).map(async photo => {
    let originalSignedUrl: string | null = null;
    try { if (photo.original_path) originalSignedUrl = await createOriginalDownloadUrl(String(photo.original_path), 300); } catch {}
    return { ...photo, originalSignedUrl };
  }));





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
        max-w-7xl
        mx-auto
        px-6
        "
      >



        <div
          className="
          flex
          justify-between
          items-center
          mb-10
          "
        >


          <div>

            <h1
              className="
              text-4xl
              font-bold
              "
            >
              Fotos
            </h1>


            <p className="text-neutral-400 mt-2">
              {event.name}
            </p>

          </div>




          <a
            href={`/admin/events/${id}`}
            className="
            bg-neutral-700
            px-5
            py-3
            rounded-lg
            font-bold
            "
          >
            ← Voltar
          </a>


        </div>







        <div
          className="
          grid
          grid-cols-2
          md:grid-cols-4
          lg:grid-cols-6
          gap-5
          "
        >



        {
          photosWithUrls.map(
            (photo:any)=>(


              <div
                key={photo.id}
                className="
                bg-neutral-900
                border
                border-neutral-800
                rounded-xl
                overflow-hidden
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





                <div
                  className="
                  p-3
                  "
                >



                  <p className="font-bold">
                    #{String(photo.number).padStart(4,"0")}
                  </p>



                  <p
                    className="
                    text-sm
                    text-neutral-400
                    "
                  >
                    {photo.status}
                  </p>





                  <div
                    className="
                    flex
                    gap-2
                    mt-3
                    "
                  >



                    <a
                      href={photo.originalSignedUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!photo.originalSignedUrl}
                      className="
                      flex-1
                      bg-neutral-700
                      text-center
                      py-2
                      rounded
                      text-sm
                      aria-disabled:pointer-events-none aria-disabled:opacity-50
                      "
                    >
                      Ver
                    </a>





                    <DeletePhotoButton
                      id={photo.id}
                    />



                  </div>




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
