"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type { EventPhoto } from "@/types";
import { calculatePrice, DEFAULT_PRICING_PACKAGES, type PricingPackage } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload, User } from "@supabase/supabase-js";


interface CartContextProps {

  items: EventPhoto[];

  addToCart: (
    photo: EventPhoto
  ) => void;

  removeFromCart: (
    id: string
  ) => void;

  clearCart: () => void;

  total: number;
  pricing: ReturnType<typeof calculatePrice>;

  discountLabel: string;
  nextDiscount: string;

  favorites: EventPhoto[];

  toggleFavorite: (photo: EventPhoto) => void;

}



const CartContext =
  createContext<CartContextProps | null>(
    null
  );



const CART_KEY = "mm-fotografias-cart";
const FAVORITES_KEY = "mm-fotografias-favorites";

const uniquePhotos = (...lists: EventPhoto[][]) => {
  const result = new Map<string, EventPhoto>();
  for (const photo of lists.flat()) if (photo?.id) result.set(photo.id, photo);
  return [...result.values()];
};



export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {


  const [items, setItems] =
    useState<EventPhoto[]>([]);

  const [favorites, setFavorites] = useState<EventPhoto[]>([]);
  const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>(DEFAULT_PRICING_PACKAGES);
  const [eventPricing, setEventPricing] = useState<Record<string, PricingPackage[]>>({});
  const [hydrated, setHydrated] = useState(false);
  const [accountSync, setAccountSync] = useState(false);





  useEffect(() => {

    const savedCart =
      localStorage.getItem(CART_KEY);


    if (savedCart) {

      try {

        setItems(
          JSON.parse(savedCart)
        );

      } catch {

        localStorage.removeItem(
          CART_KEY
        );

      }

    }

    try { setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")); } catch { localStorage.removeItem(FAVORITES_KEY); }
    setHydrated(true);

  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const applyRemote = (state: { cart?: EventPhoto[]; favorites?: EventPhoto[] }, merge = false) => {
      if (!active) return;
      setItems(current => merge ? uniquePhotos(current, state.cart || []) : (state.cart || []));
      setFavorites(current => merge ? uniquePhotos(current, state.favorites || []) : (state.favorites || []));
    };
    fetch("/api/account/sync", { cache: "no-store" }).then(r => r.json()).then(data => {
      if (!active || !data.authenticated) return;
      setAccountSync(true);
      applyRemote(data.state || {}, true);
    }).catch(() => undefined);
    const supabase = createClient();
    let room: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (!active || !data.user) return;
      room = supabase.channel(`account-sync:${data.user.id}`).on("postgres_changes", { event: "*", schema: "public", table: "account_sync_state", filter: `user_id=eq.${data.user.id}` }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => applyRemote((payload.new || {}) as { cart?: EventPhoto[]; favorites?: EventPhoto[] })).subscribe();
    });
    const refresh = () => { if (document.visibilityState === "visible") fetch("/api/account/sync", { cache: "no-store" }).then(r => r.json()).then(data => data.authenticated && applyRemote(data.state || {})).catch(() => undefined); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); if (room) void supabase.removeChannel(room); };
  }, [hydrated]);

  useEffect(() => { fetch("/api/pricing").then(response => response.json()).then(data => { if (data.packages?.length) setPricingPackages(data.packages); }).catch(() => undefined); }, []);
  const eventIdsKey = [...new Set(items.map(item => item.eventId).filter(Boolean))].sort().join(",");
  useEffect(() => { if (!eventIdsKey) { const timer = window.setTimeout(() => setEventPricing({}), 0); return () => window.clearTimeout(timer); } fetch(`/api/pricing?eventIds=${encodeURIComponent(eventIdsKey)}`).then(response => response.json()).then(data => setEventPricing(data.eventPackages || {})).catch(() => undefined); }, [eventIdsKey]);






  useEffect(() => {

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(items)
    );

  }, [items]);

  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    if (!hydrated || !accountSync) return;
    const timer = window.setTimeout(() => { void fetch("/api/account/sync", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart: items, favorites }) }); }, 450);
    return () => window.clearTimeout(timer);
  }, [items, favorites, hydrated, accountSync]);

  function toggleFavorite(photo: EventPhoto) {
    setFavorites(current => current.some(item => item.id === photo.id) ? current.filter(item => item.id !== photo.id) : [...current, photo]);
  }








  function addToCart(
    photo: EventPhoto
  ) {


    setItems((current) => {


      const exists =
        current.some(
          item =>
            item.id === photo.id
        );


      if (exists) {

        return current;

      }



      return [
        ...current,
        photo
      ];


    });


  }







  function removeFromCart(
    id: string
  ) {


    setItems(
      current =>
        current.filter(
          item =>
            item.id !== id
        )
    );


  }







  function clearCart() {


    setItems([]);


    localStorage.removeItem(
      CART_KEY
    );


  }








  const groups = Object.values(items.reduce<Record<string, EventPhoto[]>>((result, item) => { const key = item.eventId || item.slug; (result[key] ||= []).push(item); return result; }, {}));
  const groupPrices = groups.map(group => calculatePrice(group.length, eventPricing[group[0].eventId || ""] || pricingPackages, Number(group[0].preco || 15)));
  const pricing = { pricePerPhoto: items.length ? groupPrices.reduce((sum, value) => sum + value.total, 0) / items.length : 0, subtotal: groupPrices.reduce((sum, value) => sum + value.subtotal, 0), total: groupPrices.reduce((sum, value) => sum + value.total, 0), economy: groupPrices.reduce((sum, value) => sum + value.economy, 0), label: groupPrices.map(value => value.label).filter(Boolean).join(" · ") };
  const discountLabel = pricing.label;
  const nextCandidates = groups.map(group => { const packages = eventPricing[group[0].eventId || ""] || pricingPackages; const next = [...packages].filter(item => item.minQuantity > group.length).sort((a, b) => a.minQuantity - b.minQuantity)[0]; return next ? { missing: next.minQuantity - group.length, label: next.label, event: group[0].evento } : null; }).filter(Boolean) as Array<{ missing: number; label: string; event: string }>;
  const closestDiscount = nextCandidates.sort((a, b) => a.missing - b.missing)[0];
  const nextDiscount = closestDiscount ? `Faltam ${closestDiscount.missing} foto${closestDiscount.missing === 1 ? "" : "s"} de ${closestDiscount.event} para ${closestDiscount.label.toLowerCase()}.` : "Você já atingiu o melhor pacote disponível.";
  const total = pricing.total;








  return (

    <CartContext.Provider

      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        pricing,
        discountLabel,
        nextDiscount,
        favorites,
        toggleFavorite,
      }}

    >

      {children}

    </CartContext.Provider>

  );


}







export function useCart() {


  const context =
    useContext(CartContext);



  if (!context) {

    throw new Error(
      "useCart precisa estar dentro do CartProvider"
    );

  }



  return context;


}
