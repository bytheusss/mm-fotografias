"use client";
import { useState } from "react";

export function ServiceRequestForm({ service, packageSlug, packages=[] }: { service: string; packageSlug?: string; packages?: Array<{slug:string;name:string}> }) {
  const [sending,setSending]=useState(false),[message,setMessage]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setSending(true);setMessage("");const form=new FormData(event.currentTarget);const body=Object.fromEntries(form.entries());const response=await fetch("/api/services/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,serviceSlug:service,packageSlug:packageSlug||body.packageSlug})});const data=await response.json().catch(()=>({}));setSending(false);if(response.ok){setMessage(`Pedido recebido! Protocolo ${data.protocol}. Vamos chamar você no WhatsApp.`);event.currentTarget.reset()}else setMessage(data.error||"Não foi possível enviar agora.")}
  return <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:grid-cols-2 sm:p-7">
    <div className="sm:col-span-2"><p className="text-sm font-bold uppercase tracking-widest text-red-500">Solicitar orçamento</p><h2 className="mt-2 text-3xl font-black">Conte o que você está planejando</h2><p className="mt-2 text-neutral-400">Sem compromisso. Respondemos pelo WhatsApp com disponibilidade e próximos passos.</p></div>
    {packageSlug?<input type="hidden" name="packageSlug" value={packageSlug}/>:<select name="packageSlug" defaultValue="" className="rounded-xl border border-neutral-700 bg-black p-4 text-white"><option value="">Pacote a definir</option>{packages.map(item=><option key={item.slug} value={item.slug}>{item.name}</option>)}</select>}
    {packageSlug&&<p className="rounded-xl border border-red-900 bg-red-950/30 p-4 font-bold sm:col-span-2">Pacote selecionado: {packages.find(item=>item.slug===packageSlug)?.name||packageSlug}</p>}
    <input required name="clientName" placeholder="Seu nome" className="rounded-xl border border-neutral-700 bg-black p-4"/>
    <input required type="email" name="email" placeholder="Seu e-mail" className="rounded-xl border border-neutral-700 bg-black p-4"/>
    <input required name="whatsapp" inputMode="tel" placeholder="WhatsApp com DDD" className="rounded-xl border border-neutral-700 bg-black p-4"/>
    <label className="grid gap-2 text-sm text-neutral-400">Data desejada<input type="date" name="eventDate" className="rounded-xl border border-neutral-700 bg-black p-4 text-white"/></label>
    <input name="city" placeholder="Cidade" className="rounded-xl border border-neutral-700 bg-black p-4"/>
    <input name="venue" placeholder="Local (se já souber)" className="rounded-xl border border-neutral-700 bg-black p-4"/>
    <input type="number" min="1" name="guests" placeholder="Quantidade aproximada de pessoas" className="rounded-xl border border-neutral-700 bg-black p-4"/>
    <input type="number" min="0" step="50" name="budget" placeholder="Orçamento previsto (opcional)" className="rounded-xl border border-neutral-700 bg-black p-4"/>
    <textarea name="notes" rows={5} placeholder="Conte os detalhes, horários e o que é importante para você" className="rounded-xl border border-neutral-700 bg-black p-4 sm:col-span-2"/>
    <label className="flex items-start gap-3 text-sm text-neutral-400 sm:col-span-2"><input required type="checkbox" name="consent" value="yes" className="mt-1"/>Autorizo o contato da M&M sobre este orçamento e li a Política de Privacidade.</label>
    <button disabled={sending} className="rounded-xl bg-red-600 px-6 py-4 font-black text-white hover:bg-red-500 disabled:opacity-50 sm:col-span-2">{sending?"Enviando…":"Quero receber uma proposta"}</button>
    {message&&<p aria-live="polite" className="rounded-lg bg-neutral-900 p-3 text-center text-sm sm:col-span-2">{message}</p>}
  </form>
}
