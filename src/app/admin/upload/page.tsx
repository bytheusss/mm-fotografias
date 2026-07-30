"use client";

import { useState } from "react";

export default function UploadPage() {

  const [files,setFiles] = useState<File[]>([]);
  const [eventId,setEventId] = useState("");
  const [slug,setSlug] = useState("");

  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");


  async function handleUpload(){

    if(!files.length){
      alert("Selecione as fotos");
      return;
    }

    const formData = new FormData();

    files.forEach(file=>{
      formData.append("files", file);
    });

    formData.append("event_id", eventId);
    formData.append("slug", slug);

    setLoading(true);

    const response = await fetch(
      "/api/upload-batch",
      {
        method:"POST",
        body:formData
      }
    );

    const data = await response.json();


    if(data.success){

      setMessage(
        `${data.total} fotos enviadas com sucesso!`
      );

    }else{

      setMessage(
        data.error || "Erro"
      );

    }

    setLoading(false);

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
          max-w-xl
          mx-auto
          px-6
          mt-8
        "
      >

        <div
          className="
            bg-neutral-900
            rounded-xl
            p-8
            border
            border-neutral-800
          "
        >

          <h1
            className="
              text-3xl
              font-bold
              mb-8
            "
          >
            Upload de Fotos
          </h1>


          <label className="block mb-2">
            ID do Evento
          </label>

          <input
            className="
              w-full
              bg-neutral-800
              rounded-lg
              p-3
              mb-5
              outline-none
            "
            placeholder="uuid do evento"
            value={eventId}
            onChange={
              e=>setEventId(e.target.value)
            }
          />


          <label className="block mb-2">
            Slug
          </label>

          <input
            className="
              w-full
              bg-neutral-800
              rounded-lg
              p-3
              mb-5
              outline-none
            "
            placeholder="aacrc-05072026"
            value={slug}
            onChange={
              e=>setSlug(e.target.value)
            }
          />


          <label className="block mb-2">
            Fotos
          </label>


          <input
            type="file"
            multiple
            accept="image/*"
            className="
              mb-6
              block
              w-full
            "
            onChange={
              e=>
                setFiles(
                  Array.from(
                    e.target.files || []
                  )
                )
            }
          />


          <p
            className="
              text-neutral-400
              mb-5
            "
          >
            {files.length} fotos selecionadas
          </p>


          <button
            onClick={handleUpload}
            disabled={loading}
            className="
              w-full
              bg-red-600
              hover:bg-red-700
              disabled:opacity-50
              rounded-lg
              py-3
              font-bold
              transition
            "
          >

            {
              loading
              ?
              "Enviando..."
              :
              "Enviar fotos"
            }

          </button>


          {
            message &&
            <p
              className="
                mt-5
                text-center
                text-neutral-300
              "
            >
              {message}
            </p>
          }


        </div>

      </div>

    </main>

  );

}