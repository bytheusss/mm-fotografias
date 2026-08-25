"use client";
import { useEffect, useState } from "react";

function decode(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map(char => char.charCodeAt(0)));
}
function sameKey(subscription: PushSubscription, publicKey: string) {
  const current = subscription.options.applicationServerKey;
  if (!current) return false;
  const expected = decode(publicKey), actual = new Uint8Array(current);
  return actual.length === expected.length && actual.every((byte, index) => byte === expected[index]);
}
async function register(subscription: PushSubscription) {
  return fetch("/api/push/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription.toJSON()) });
}
async function ensureSubscription(registration: ServiceWorkerRegistration, publicKey: string) {
  let subscription = await registration.pushManager.getSubscription();
  if (subscription && !sameKey(subscription, publicKey)) {
    await fetch("/api/push/subscription", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) }).catch(() => undefined);
    await subscription.unsubscribe();
    subscription = null;
  }
  if (!subscription && Notification.permission === "granted") subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decode(publicKey) });
  return subscription;
}

export function PushNotifications() {
  const [available, setAvailable] = useState(false), [enabled, setEnabled] = useState(false), [message, setMessage] = useState(""), [testing, setTesting] = useState(false);
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    fetch("/api/push/subscription").then(response => response.json()).then(async config => {
      if (!config.authenticated || !config.configured || !config.publicKey) return;
      setAvailable(true);
      const subscription = await ensureSubscription(await navigator.serviceWorker.ready, config.publicKey);
      if (subscription) setEnabled((await register(subscription)).ok);
    }).catch(() => undefined);
  }, []);
  async function enable() {
    try {
      if (Notification.permission === "denied") return setMessage("Notificações bloqueadas. Libere a M&M nas configurações do navegador.");
      if (await Notification.requestPermission() !== "granted") return setMessage("A permissão de notificações não foi concedida.");
      const config = await fetch("/api/push/subscription").then(response => response.json());
      if (!config.configured || !config.publicKey) return setMessage("As chaves de notificação não estão configuradas na Vercel.");
      const subscription = await ensureSubscription(await navigator.serviceWorker.ready, config.publicKey);
      if (!subscription) throw new Error("O navegador não criou a assinatura.");
      const response = await register(subscription);
      setEnabled(response.ok); setMessage(response.ok ? "Notificações ativadas e vinculadas à sua conta." : "Não foi possível registrar este aparelho.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível ativar."); }
  }
  async function test() {
    setTesting(true); setMessage("Enviando teste…");
    const response = await fetch("/api/push/subscription", { method: "PATCH" }), data = await response.json().catch(() => ({}));
    if (response.ok) setMessage(`Teste enviado para ${data.sent} aparelho(s).`);
    else if (data.reason === "invalid_vapid_pair") setMessage("As chaves pública e privada da Vercel não formam o mesmo par. Gere um novo par VAPID e substitua as duas.");
    else if (data.reason === "missing_credentials" || data.configured === false) setMessage("As chaves de notificação não estão configuradas na Vercel.");
    else if (!data.subscriptions) { setEnabled(false); setMessage("Este aparelho perdeu a assinatura. Toque em Ativar notificações novamente."); }
    else setMessage("O serviço de push recusou o teste. Reative as notificações e tente novamente.");
    setTesting(false);
  }
  if (!available) return null;
  return <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-[170] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2 sm:bottom-5"><div className="flex flex-wrap justify-end gap-2">{enabled && <button type="button" disabled={testing} onClick={test} className="rounded-full border border-neutral-700 bg-neutral-950/95 px-4 py-3 text-sm font-bold text-white shadow-xl disabled:opacity-50">{testing ? "Testando…" : "Testar 🔔"}</button>}<button type="button" disabled={enabled} onClick={enable} className={`rounded-full border px-4 py-3 text-sm font-bold shadow-2xl backdrop-blur ${enabled ? "border-green-800 bg-green-950/90 text-green-300" : "border-red-800 bg-neutral-950/95 text-white"}`}>{enabled ? "🔔 Notificações ativas" : "🔔 Ativar notificações"}</button></div>{message && <p className="max-w-sm rounded-lg bg-black p-2 text-xs text-white shadow-xl" aria-live="polite">{message}</p>}</div>;
}
