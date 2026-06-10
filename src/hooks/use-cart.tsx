import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  designId: number;
  tissusId: number;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  add: (i: Omit<CartItem, "quantity">) => void;
  remove: (designId: number) => void;
  setQty: (designId: number, q: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<CartCtx | null>(null);
const KEY = "modolk_cart_v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch { /* ignore corrupted storage */ }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value: CartCtx = {
    items,
    add: (i) =>
      setItems((cur) => {
        const ex = cur.find((c) => c.designId === i.designId && c.tissusId === i.tissusId);
        if (ex) return cur.map((c) => c.designId === i.designId && c.tissusId === i.tissusId ? { ...c, quantity: c.quantity + 1 } : c);
        return [...cur, { ...i, quantity: 1 }];
      }),
    remove: (designId) => setItems((cur) => cur.filter((c) => c.designId !== designId)),
    setQty: (designId, q) =>
      setItems((cur) =>
        q <= 0 ? cur.filter((c) => c.designId !== designId) : cur.map((c) => (c.designId === designId ? { ...c, quantity: q } : c)),
      ),
    clear: () => setItems([]),
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
