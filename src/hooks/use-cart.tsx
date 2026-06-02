import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  add: (i: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQty: (id: string, q: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "modolk_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value: CartCtx = {
    items,
    add: (i) =>
      setItems((cur) => {
        const ex = cur.find((c) => c.id === i.id);
        if (ex) return cur.map((c) => (c.id === i.id ? { ...c, quantity: c.quantity + 1 } : c));
        return [...cur, { ...i, quantity: 1 }];
      }),
    remove: (id) => setItems((cur) => cur.filter((c) => c.id !== id)),
    setQty: (id, q) =>
      setItems((cur) =>
        q <= 0 ? cur.filter((c) => c.id !== id) : cur.map((c) => (c.id === id ? { ...c, quantity: q } : c)),
      ),
    clear: () => setItems([]),
    total: items.reduce((s, i) => s + i.price_cents * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

export const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
