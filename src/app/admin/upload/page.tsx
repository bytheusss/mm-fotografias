"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UploadPage() {

  const [files,setFiles] = useState<File[]>([]);
  const [eventId,setEventId] = useState("");
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");
  const [progress,setProgress] = useState(0);
  const [events,setEvents] = useState<Array<{ id: string; name: string; slug: string; archived: boolean }>>([]);

  useEffect(() => { const timer = window.setTimeout(async () => { const selected = new URLSearchParams(window.location.search).get("event") || ""; const response = await fetch("/api/admin/events"); const data = await response.json(); setEvents(data.events || []); setEventId(selected); }, 0); return () => window.clearTimeout(timer); }, []);


  async function handleUpload(){

    if(!files.length){
      alert("Selecione as fotos");
      return;
    }
    if(!eventId){ alert("Selecione o evento"); return; }

    setLoading(true);
    setMessage(""); setProgress(0); let sent = 0;
    try {
      for (const file of files) {
        setMessage(`${sent} de ${files.length} · preparando ${file.name}`);
        const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer()); const checksum = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
        const signedResponse = await fetch(`/api/admin/events/${eventId}/photos-direct`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size: file.size, type: file.type, checksum }), signal: AbortSignal.timeout(30000) });
        const signed = await signedResponse.json().catch(() => ({})); if (!signedResponse.ok) throw new Error(signed.error || `Erro ao preparar ${file.name}`);
        setMessage(`${sent} de ${files.length} · enviando ${file.name}`);
        const { error: uploadError } = await createClient().storage.from("originals").uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
        if (uploadError) throw new Error(`${file.name}: ${uploadError.message}`);
        setMessage(`${sent} de ${files.length} · processando ${file.name}`);
        const response = await fetch(`/api/admin/events/${eventId}/photos-direct`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: signed.path, checksum }), signal: AbortSignal.timeout(90000) });
        const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `Erro em ${file.name}`);
        sent += 1; setProgress(Math.round(sent / files.length * 100)); setMessage(`${sent} de ${files.length} fotos processadas`);
      }
      setMessage(`${sent} fotos enviadas com marca-d'água nas prévias.`); setFiles([]);
    } catch (error) { setFiles(current => current.slice(sent)); setMessage(`${sent} enviadas. Restantes mantidas para tentar novamente. ${error instanceof Error ? error.message : "Erro no upload"}`); }
    finally { setLoading(false); }

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
            Evento
          </label>

          <select
            className="
              w-full
              bg-neutral-800
              rounded-lg
              p-3
              mb-5
              outline-none
            "
            value={eventId}
            onChange={
              e=>setEventId(e.target.value)
            }
          ><option value="">Selecione o evento</option>{events.filter(event => !event.archived).map(event => <option key={event.id} value={event.id}>{event.name} ({event.slug})</option>)}</select>


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

          {loading && <div className="mb-5 h-3 overflow-hidden rounded bg-neutral-800"><div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} /></div>}


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
