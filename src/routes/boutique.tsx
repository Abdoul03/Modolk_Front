import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatPrice } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import logo from "@/assets/modolk-logo.png";
import femmeImg from "@/assets/femme.jpg";
import hommeImg from "@/assets/homme.jpg";
import enfantImg from "@/assets/enfant.jpg";

export const Route = createFileRoute("/boutique")({
  component: BoutiquePage,
  head: () => ({ meta: [{ title: "Boutique — MODOLK" }] }),
});

type Category = "tous" | "femme" | "homme" | "enfant" | "accessoires";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: string;
  image_url: string | null;
  stock: number;
}

const fallback: Record<string, string> = {
  femme: femmeImg,
  homme: hommeImg,
  enfant: enfantImg,
};

function BoutiquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState<Category>("tous");
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [shipping, setShipping] = useState({ address: "", phone: "", notes: "" });

  useEffect(() => {
    supabase.from("products").select("id, name, description, price_cents, category, image_url, stock")
      .eq("active", true)
      .order("featured", { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () => (cat === "tous" ? products : products.filter((p) => p.category === cat)),
    [cat, products],
  );

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    if (cart.items.length === 0) return;
    setCheckingOut(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total_cents: cart.total,
      shipping_address: shipping.address,
      phone: shipping.phone,
      notes: shipping.notes,
    }).select("id").single();
    if (error || !order) { toast.error(error?.message ?? "Erreur"); setCheckingOut(false); return; }
    const { error: itemsErr } = await supabase.from("order_items").insert(
      cart.items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        unit_price_cents: i.price_cents,
        quantity: i.quantity,
      })),
    );
    setCheckingOut(false);
    if (itemsErr) { toast.error(itemsErr.message); return; }
    cart.clear();
    toast.success("Commande passée avec succès.");
    navigate({ to: "/compte" });
  }

  const cats: Category[] = ["tous", "femme", "homme", "enfant", "accessoires"];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="MODOLK" className="h-9 w-9 object-contain" />
          <span className="tracking-[0.25em] text-sm">MODOLK</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/compte" className="text-muted-foreground hover:text-foreground">Mon compte</Link>
          <span className="rounded-full border border-border px-3 py-1.5 text-xs">
            Panier · {cart.count} · {formatPrice(cart.total)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-xs tracking-[0.3em] text-accent">BOUTIQUE</div>
        <h1 className="mt-3 text-4xl font-light md:text-5xl">Notre collection</h1>

        <div className="mt-8 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition ${
                cat === c
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">Aucun produit pour cette catégorie.</p>
          ) : (
            filtered.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={p.image_url || fallback[p.category] || femmeImg}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-accent">{p.category}</div>
                  <h3 className="mt-1 text-lg font-light">{p.name}</h3>
                  {p.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base">{formatPrice(p.price_cents)}</span>
                    <button
                      disabled={p.stock <= 0}
                      onClick={() => {
                        cart.add({ id: p.id, name: p.name, price_cents: p.price_cents, image_url: p.image_url });
                        toast.success(`${p.name} ajouté au panier`);
                      }}
                      className="rounded-full px-4 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
                      style={{ background: "var(--gradient-gold)" }}
                    >
                      {p.stock <= 0 ? "Rupture" : "Ajouter"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Cart */}
        <section className="mt-20 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-light">Mon panier</h2>
          {cart.items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Votre panier est vide.</p>
          ) : (
            <>
              <ul className="mt-6 divide-y divide-border">
                {cart.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <div className="text-sm">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{formatPrice(i.price_cents)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={i.quantity}
                        onChange={(e) => cart.setQty(i.id, Number(e.target.value))}
                        className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      />
                      <span className="w-20 text-right text-sm">{formatPrice(i.price_cents * i.quantity)}</span>
                      <button onClick={() => cart.remove(i.id)} className="text-xs text-muted-foreground hover:text-foreground">
                        Retirer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl">{formatPrice(cart.total)}</span>
              </div>

              <form onSubmit={checkout} className="mt-8 grid gap-4 md:grid-cols-2">
                <input
                  required
                  placeholder="Adresse de livraison"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  className="md:col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="Téléphone"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  placeholder="Notes (optionnel)"
                  value={shipping.notes}
                  onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  disabled={checkingOut}
                  className="md:col-span-2 rounded-full px-6 py-3 text-sm font-medium text-accent-foreground disabled:opacity-60"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  {checkingOut ? "..." : user ? "Valider la commande" : "Se connecter pour commander"}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
