"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


export default function EditEventPage(){

  const params = useParams();
  const router = useRouter();

  const id = params.id as string;


  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);


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


      setForm(data.event);

      setLoading(false);

    }


    load();


  },[id]);





  function change(
    e:any
  ){

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
      <main className="bg-black min-h-screen text-white p-20">
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
          space-y-5
          "
        >



          {
            [
              ["name","Nome"],
              ["city","Cidade"],
              ["event_date","Data"],
              ["slug","Slug"],
              ["cover_image","Imagem capa"]
            ]
            .map(
              ([name,label])=>(


                <div key={name}>


                  <label className="block mb-2">
                    {label}
                  </label>


                  <input
                    name={name}
                    value={(form as any)[name]}
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






          <label
            className="
            flex
            gap-3
            items-center
            "
          >

            <input
              type="checkbox"
              checked={form.published}
              onChange={change}
              name="published"
            />


            Evento publicado

          </label>





          <button
            onClick={save}
            disabled={saving}
            className="
            w-full
            bg-red-600
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