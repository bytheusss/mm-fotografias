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

  favorites: EventPhoto[];

  toggleFavorite: (photo: EventPhoto) => void;

}



const CartContext =
  createContext<CartContextProps | null>(
    null
  );



const CART_KEY = "mm-fotografias-cart";
const FAVORITES_KEY = "mm-fotografias-favorites";



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

  }, []);

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
