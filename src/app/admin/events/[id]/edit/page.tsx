"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EventPricingManager from "@/components/admin/EventPricingManager";


export default function EditEventPage(){

  const params = useParams();
  const router = useRouter();

  const id = params.id as string;


  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [uploadStage,setUploadStage] = useState("");
  const [message,setMessage] = useState("");
  const [photographers,setPhotographers] = useState<Array<{ id:string; full_name?:string; email:string }>>([]);


  const [newCover,setNewCover] = useState<File|null>(null);



  const [form,setForm] = useState({

    name:"",
    city:"",
    event_date:"",
    slug:"",
    cover_image:"",
    published:false,
    share_message:"",
    base_price:15,
    access_mode:"public",
    access_password:"",
    sales_paused:false,
    publish_at:"",
    unpublish_at:"",
    access_expires_at:"",
    photographer_ids:[] as string[],
    default_photographer_id:""

  });




  useEffect(()=>{


    async function load(){


      const [res, peopleResponse] = await Promise.all([fetch(`/api/admin/events/${id}`), fetch("/api/admin/photographers")]);
      const [data, people] = await Promise.all([res.json(), peopleResponse.json()]);



      setForm(
        data.event
      );
      setPhotographers(people.photographers || []);


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

      setMessage("Selecione uma imagem.");

      return;

    }



    setUploading(true);
    try {
      setUploadStage("Preparando…");
      const signedResponse = await fetch(`/api/admin/events/${id}/cover-direct`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size: newCover.size, type: newCover.type }), signal: AbortSignal.timeout(30000) });
      const signed = await signedResponse.json().catch(() => ({}));
      if (!signedResponse.ok) throw new Error(signed.error || "Não foi possível preparar o envio.");
      setUploadStage("Enviando…");
      const { error: uploadError } = await createClient().storage.from("thumbnails").uploadToSignedUrl(signed.path, signed.token, newCover, { contentType: newCover.type });
      if (uploadError) throw uploadError;
      setUploadStage("Processando…");
      const finishResponse = await fetch(`/api/admin/events/${id}/cover-direct`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: signed.path }), signal: AbortSignal.timeout(90000) });
      const data = await finishResponse.json().catch(() => ({}));
      if (!finishResponse.ok) throw new Error(data.error || "Erro ao processar a capa.");
      setForm(current => ({ ...current, cover_image: data.url }));
      setNewCover(null);
      setMessage("Capa enviada e salva!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro no upload da capa.");
    } finally {
      setUploading(false);
      setUploadStage("");
    }


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


      setMessage(data.error || "Não foi possível salvar o evento.");


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
        px-4 sm:px-6
        "
      >



        <h1
          className="
          text-3xl sm:text-4xl
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
          p-5 sm:p-8
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

          <div><label className="mb-2 block">Mensagem padrão do WhatsApp</label><textarea name="share_message" value={form.share_message || ""} onChange={change} rows={5} maxLength={1200} placeholder="Mensagem sugerida ao compartilhar este evento" className="w-full rounded bg-neutral-800 p-3" /><p className="mt-1 text-xs text-neutral-500">O administrador ainda poderá editar antes de abrir o WhatsApp.</p></div>

          <div><label className="mb-2 block">Preço base por foto (R$)</label><input name="base_price" type="number" min="0.01" step="0.01" value={form.base_price} onChange={change} className="w-full rounded bg-neutral-800 p-3" /></div>

          <div><label className="mb-2 block">Visibilidade do evento</label><select name="access_mode" value={form.access_mode} onChange={change} className="w-full rounded bg-neutral-800 p-3"><option value="public">Público — aparece na lista</option><option value="unlisted">Não listado — somente pelo link</option><option value="password">Protegido por senha</option></select><p className="mt-1 text-xs text-neutral-500">Eventos não listados e protegidos não aparecem na página Eventos.</p></div>

          {form.access_mode === "password" && <div><label className="mb-2 block">Senha do álbum</label><input name="access_password" type="password" value={form.access_password || ""} onChange={change} autoComplete="new-password" placeholder="Deixe em branco para manter a senha atual" className="w-full rounded bg-neutral-800 p-3" /></div>}

          <fieldset className="rounded-xl border border-neutral-700 p-4"><legend className="px-2 font-bold">Fotógrafos do evento</legend>{photographers.length ? <div className="grid gap-2 sm:grid-cols-2">{photographers.map(person => { const checked = form.photographer_ids?.includes(person.id); return <label key={person.id} className="flex items-center gap-3 rounded-lg bg-black p-3"><input type="checkbox" checked={checked} onChange={event => setForm(current => ({ ...current, photographer_ids: event.target.checked ? [...(current.photographer_ids || []), person.id] : (current.photographer_ids || []).filter(value => value !== person.id), default_photographer_id: !event.target.checked && current.default_photographer_id === person.id ? "" : current.default_photographer_id }))}/><span className="min-w-0"><b className="block truncate">{person.full_name || person.email}</b><small className="block truncate text-neutral-500">{person.email}</small></span></label>; })}</div> : <p className="text-sm text-neutral-400">Cadastre fotógrafos em Equipe para vinculá-los.</p>}{form.photographer_ids?.length > 0 && <label className="mt-4 block text-sm text-neutral-400">Fotógrafo padrão dos uploads<select value={form.default_photographer_id || ""} onChange={event => setForm(current => ({ ...current, default_photographer_id: event.target.value }))} className="mt-2 w-full rounded bg-neutral-800 p-3 text-white"><option value="">Primeiro selecionado</option>{photographers.filter(person => form.photographer_ids.includes(person.id)).map(person => <option key={person.id} value={person.id}>{person.full_name || person.email}</option>)}</select></label>}</fieldset>

          <label className="flex items-center gap-3 rounded-lg bg-yellow-950/30 p-4"><input type="checkbox" name="sales_paused" checked={Boolean(form.sales_paused)} onChange={change} />Pausar novas compras sem tirar o evento do ar</label>
          <div className="grid gap-4 md:grid-cols-3"><label className="text-sm text-neutral-400">Publicar a partir de<input type="datetime-local" name="publish_at" value={form.publish_at ? String(form.publish_at).slice(0, 16) : ""} onChange={change} className="mt-2 w-full rounded bg-neutral-800 p-3 text-white" /></label><label className="text-sm text-neutral-400">Encerrar vendas/publicação<input type="datetime-local" name="unpublish_at" value={form.unpublish_at ? String(form.unpublish_at).slice(0, 16) : ""} onChange={change} className="mt-2 w-full rounded bg-neutral-800 p-3 text-white" /></label><label className="text-sm text-neutral-400">Expirar acesso ao álbum<input type="datetime-local" name="access_expires_at" value={form.access_expires_at ? String(form.access_expires_at).slice(0, 16) : ""} onChange={change} className="mt-2 w-full rounded bg-neutral-800 p-3 text-white" /></label></div>








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
                uploadStage || "Enviando…"
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

          {message && <p className={`rounded-lg p-3 text-sm ${message.includes("salva") ? "bg-green-950 text-green-200" : "bg-red-950 text-red-200"}`} role="status">{message}</p>}

          <EventPricingManager eventId={id} />





        </div>


      </div>


    </main>

  );


}
