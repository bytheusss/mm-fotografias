"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";


export default function DeletePhotoButton({
  id
}:{
  id:string;
}){


  const router = useRouter();

  const [loading,setLoading] = useState(false);



  async function remove(){


    const confirmDelete =
      confirm(
        "Tem certeza que deseja excluir essa foto?"
      );


    if(!confirmDelete) return;



    setLoading(true);



    const res =
      await fetch(
        `/api/admin/photos/${id}`,
        {
          method:"DELETE"
        }
      );



    const data =
      await res.json();



    if(data.success){

      router.refresh();

    }else{

      alert(
        data.error || "Erro ao excluir"
      );

    }


    setLoading(false);


  }



  return (

    <button
      onClick={remove}
      disabled={loading}
      className="
      flex-1
      bg-red-600
      hover:bg-red-700
      py-2
      rounded
      text-sm
      "
    >

      {
        loading
        ?
        "..."
        :
        "Excluir"
      }

    </button>

  );

}