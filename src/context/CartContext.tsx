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








  const discountLabel = calculatePrice(items.length, pricingPackages).label;








  const total = calculatePrice(items.length, pricingPackages).total;
  const pricing = calculatePrice(items.length, pricingPackages);








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
