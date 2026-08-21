"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export function EventShareTools({ title }: { title: string }) {
  const [url, setUrl] = useState(""); const [qr, setQr] = useState(""); const [copied, setCopied] = useState(false);
  useEffect(() => { const current = window.location.href; setUrl(current); void QRCode.toDataURL(current, { width: 220, margin: 1, color: { dark: "#000000", light: "#ffffff" } }).then(setQr); }, []);
  async function share() { if (navigator.share) await navigator.share({ title, url }); else { await navigator.clipboard.writeText(url); setCopied(true); } }
  if (!url) return null;
  return <div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={share} className="rounded-lg bg-neutral-800 px-4 py-2 font-semibold hover:bg-neutral-700">{copied ? "Link copiado" : "Compartilhar evento"}</button><a href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-green-700 px-4 py-2 font-semibold hover:bg-green-600">Enviar pelo WhatsApp</a><details className="relative"><summary className="cursor-pointer rounded-lg bg-neutral-800 px-4 py-2 font-semibold">QR Code</summary>{qr && <div className="absolute left-0 z-20 mt-2 rounded-xl bg-white p-3 shadow-xl"><Image unoptimized src={qr} width={220} height={220} alt={`QR Code do evento ${title}`} /></div>}</details></div>;
}
