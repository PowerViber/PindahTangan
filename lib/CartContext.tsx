"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabase";

export interface CartProduct {
  id: string;
  name: string;
  grade: "MINT" | "GOOD" | "FAIR" | string;
  price: number;
  image_url?: string | null;
  sold?: boolean;
  seller_id?: string | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  created_at: string;
  product: CartProduct;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  isInCart: (productId: string) => boolean;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

type RawCartRow = Omit<CartItem, "product"> & { product: CartProduct | CartProduct[] | null };

function normalizeCartRows(data: RawCartRow[]): CartItem[] {
  return data
    .map((row) => ({
      ...row,
      product: Array.isArray(row.product) ? row.product[0] : row.product,
    }))
    .filter((row): row is CartItem => Boolean(row.product));
}

function queryCartItems(userId: string) {
  return supabase
    .from("cart_items")
    .select("id, product_id, created_at, product:products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(user).then((currentUser) => {
      if (!currentUser) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      queryCartItems(currentUser.id).then(({ data, error }) => {
        setItems(!error && data ? normalizeCartRows(data) : []);
        setLoading(false);
      });
    });
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data, error } = await queryCartItems(user.id);
    setItems(!error && data ? normalizeCartRows(data) : []);
  }, [user]);

  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.product_id === productId),
    [items]
  );

  const addToCart = useCallback(
    async (productId: string) => {
      if (!user) return;
      const { data: product } = await supabase
        .from("products")
        .select("seller_id, sold")
        .eq("id", productId)
        .single();

      if (product?.sold || product?.seller_id === user.id) return;

      await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId });
      await refresh();
    },
    [user, refresh]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (!user) return;
      await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", user.id);
      await refresh();
    },
    [user, refresh]
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  }, [user]);

  const count = items.length;
  const subtotal = items.reduce((sum, item) => sum + Number(item.product?.price || 0), 0);

  const value = useMemo(
    () => ({ items, loading, count, subtotal, isInCart, addToCart, removeFromCart, clearCart, refresh }),
    [items, loading, count, subtotal, isInCart, addToCart, removeFromCart, clearCart, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
