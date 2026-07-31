"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


export default function EditEventPage(){

  const params = useParams();
  const router = useRouter();

  const id = params.id as string;


  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [uploading,setUploading] = useState(false);


  const [newCover,setNewCover] = useState<File|null>(null);



  const [form,setForm] = useState({

    name:"",
    city:"",
    event_date:"",
    slug:"",
    cover_image:"",
    published:false

  });




  useEffect(()=>{


    async function load(){


      const res =
        await fetch(
          `/api/admin/events/${id}`
        );


      const data =
        await res.json();



      setForm(
        data.event
      );


      setLoading(false);


    }


    load();


  },[id]);







  function change(e:any){


    setForm({

      ...form,

      [e.target.name]:
      e.target.type === "checkbox"
      ?
      e.target.checked
      :
      e.target.value

    });


  }








  async function uploadCover(){


    if(!newCover){

      alert(
        "Selecione uma imagem"
      );

      return;

    }



    setUploading(true);



    const fd =
      new FormData();



    fd.append(
      "file",
      newCover
    );


    fd.append(
      "event_id",
      id
    );





    const res =
      await fetch(
        "/api/admin/events/upload-cover",
        {
          method:"POST",
          body:fd
        }
      );



    const data =
      await res.json();





    if(data.success){



      const updatedForm = {

        ...form,

        cover_image:data.url

      };



      setForm(
        updatedForm
      );




      await fetch(
        `/api/admin/events/${id}`,
        {

          method:"PUT",

          headers:{
            "Content-Type":"application/json"
          },


          body:
          JSON.stringify(
            updatedForm
          )

        }
      );



      alert(
        "Capa enviada e salva!"
      );



      setNewCover(null);



    }else{


      alert(
        data.error || "Erro no upload"
      );


    }



    setUploading(false);


  }









  async function save(){


    setSaving(true);



    const res =
      await fetch(
        `/api/admin/events/${id}`,
        {

          method:"PUT",

          headers:{
            "Content-Type":"application/json"
          },


          body:
          JSON.stringify(form)

        }
      );



    const data =
      await res.json();




    if(data.success){


      router.push(
        `/admin/events/${id}`
      );


    }else{


      alert(
        data.error
      );


    }



    setSaving(false);


  }









  if(loading){

    return (

      <main
        className="
        min-h-screen
        bg-black
        text-white
        p-20
        "
      >

        Carregando...

      </main>

    );

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
        max-w-3xl
        mx-auto
        px-6
        "
      >



        <h1
          className="
          text-4xl
          font-bold
          mb-10
          "
        >

          Editar evento

        </h1>






        <div
          className="
          bg-neutral-900
          rounded-xl
          p-8
          space-y-6
          "
        >







          {
            [
              ["name","Nome"],
              ["city","Cidade"],
              ["event_date","Data"],
              ["slug","Slug"]
            ]
            .map(
              ([name,label])=>(


                <div key={name}>


                  <label className="block mb-2">

                    {label}

                  </label>



                  <input

                    name={name}

                    value={
                      (form as any)[name]
                    }

                    onChange={change}

                    className="
                    w-full
                    bg-neutral-800
                    rounded
                    p-3
                    "

                  />


                </div>


              )
            )
          }








          <div>


            <label className="block mb-2">

              Capa atual

            </label>



            <img

              src={
                form.cover_image
              }

              className="
              w-full
              h-64
              object-cover
              rounded-xl
              "

            />


          </div>









          <div>


            <label className="block mb-2">

              Nova capa

            </label>



            <input

              type="file"

              accept="image/*"

              onChange={
                e =>
                setNewCover(
                  e.target.files?.[0] || null
                )
              }

            />







            {
              newCover && (

                <img

                  src={
                    URL.createObjectURL(
                      newCover
                    )
                  }

                  className="
                  w-full
                  h-64
                  object-cover
                  rounded-xl
                  mt-5
                  "

                />

              )
            }






            <button

              onClick={uploadCover}

              disabled={
                uploading
              }

              className="
              mt-5
              bg-blue-600
              hover:bg-blue-700
              px-5
              py-3
              rounded-lg
              font-bold
              "

            >


              {
                uploading
                ?
                "Enviando..."
                :
                "Enviar nova capa"
              }


            </button>



          </div>








          <label
            className="
            flex
            gap-3
            items-center
            "
          >


            <input

              type="checkbox"

              name="published"

              checked={
                form.published
              }

              onChange={change}

            />


            Evento publicado


          </label>








          <button

            onClick={save}

            disabled={saving}

            className="
            w-full
            bg-red-600
            hover:bg-red-700
            py-3
            rounded-lg
            font-bold
            "

          >


            {
              saving
              ?
              "Salvando..."
              :
              "Salvar alterações"
            }


          </button>





        </div>


      </div>


    </main>

  );


}