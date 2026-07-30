"use client";

import { useState } from "react";

export default function DownloadAllButton({
  token,
}: {
  token: string;
}) {

  const [loading, setLoading] = useState(false);


  async function downloadAll() {

    try {

      setLoading(true);


      const response =
        await fetch(`/api/download-all/${token}`);


      const data =
        await response.json();



      if (!data.downloads) {

        alert("Nenhuma foto encontrada");
        return;

      }



      for (const photo of data.downloads) {

        const link =
          document.createElement("a");

        link.href =
          photo.url;

        link.download =
          `${photo.numero}.jpg`;

        document.body.appendChild(link);

        link.click();

        link.remove();


        await new Promise(
          resolve => setTimeout(resolve, 500)
        );

      }


    } catch(error){

      console.error(error);

      alert(
        "Erro ao baixar fotos"
      );

    } finally {

      setLoading(false);

    }

  }



  return (

    <button
      onClick={downloadAll}
      disabled={loading}
      className="inline-block rounded-lg bg-green-600 px-6 py-3 font-bold hover:bg-green-700 transition disabled:opacity-50"
    >

      {loading
        ? "Preparando downloads..."
        : "📦 Baixar todas as fotos"
      }

    </button>

  );

}