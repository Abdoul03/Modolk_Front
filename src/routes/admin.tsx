import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { formatPrice } from "@/hooks/use-cart";
import logo from "@/assets/modolk-logo.png";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MODOLK" }] }),
});

interface ClientRow { id: string; full_name: string | null; phone: string | null; address: string | null; created_at: string; }
interface Product { id: string; name: string; description: string | null; price_cents: number; category: string; image_url: string | null; stock: number; active: boolean; featured: boolean; }
interface Order { id: string; user_id: string; status: string; total_cents: number; shipping_address: string | null; phone: string | null; created_at: string; }

const STATUSES = ["en_attente", "confirmee", "expediee", "livree", "annulee"] as const;
const CATS = ["femme", "homme", "enfant", "accessoires"] as const;

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"clients" | "produits" | "commandes">("commandes");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/compte" });
  }, [loading, user, isAdmin, navigate]);

  async function reload() {
    if (!isAdmin) return;
    const [c, p, o] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, address, created_at").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setClients(c.data ?? []);
    setProducts(p.data ?? []);
    setOrders(o.data ?? []);
  }

  useEffect(() => { reload(); }, [isAdmin]);

  if (loading || (user && !isAdmin)) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="MODOLK" className="h-9 w-9 object-contain" />
          <span className="tracking-[0.25em] text-sm">MODOLK · ADMIN</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/boutique" className="text-muted-foreground hover:text-foreground">Boutique</Link>
          <Link to="/compte" className="text-muted-foreground hover:text-foreground">Mon compte</Link>
          <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="text-muted-foreground hover:text-foreground">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-xs tracking-[0.3em] text-accent">TABLEAU DE BORD</div>
        <h1 className="mt-3 text-4xl font-light">Espace administrateur</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Clients" value={clients.length} />
          <Stat label="Produits" value={products.length} />
          <Stat label="Commandes" value={orders.length} />
          <Stat label="CA total" value={formatPrice(orders.reduce((s, o) => s + o.total_cents, 0))} />
        </div>

        <div className="mt-10 flex gap-2 border-b border-border">
          {(["commandes", "produits", "clients"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize transition ${
                tab === t ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "commandes" && <OrdersTable orders={orders} onChange={reload} />}
        {tab === "produits" && <ProductsTab products={products} onChange={reload} />}
        {tab === "clients" && <ClientsTable clients={clients} />}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-xs tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-light">{value}</div>
    </div>
  );
}

function OrdersTable({ orders, onChange }: { orders: Order[]; onChange: () => void }) {
  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status: status as Database["public"]["Enums"]["order_status"] }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Statut mis à jour"); onChange(); }
  }
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Adresse</th>
            <th className="px-4 py-3 text-left">Téléphone</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-muted-foreground">Aucune commande.</td></tr>
          ) : orders.map((o) => (
            <tr key={o.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.shipping_address || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.phone || "—"}</td>
              <td className="px-4 py-3">{formatPrice(o.total_cents)}</td>
              <td className="px-4 py-3">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ClientsTable({ clients }: { clients: ClientRow[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left">Nom</th>
            <th className="px-4 py-3 text-left">Téléphone</th>
            <th className="px-4 py-3 text-left">Adresse</th>
            <th className="px-4 py-3 text-left">Inscrit le</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-muted-foreground">Aucun client.</td></tr>
          ) : clients.map((c) => (
            <tr key={c.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3">{c.full_name || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.address || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProductsTab({ products, onChange }: { products: Product[]; onChange: () => void }) {
  const empty = { name: "", description: "", price_cents: 0, category: "femme", image_url: "", stock: 0, featured: false };
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("products").insert({
      name: form.name,
      description: form.description || null,
      price_cents: Number(form.price_cents),
      category: form.category as Database["public"]["Enums"]["product_category"],
      image_url: form.image_url || null,
      stock: Number(form.stock),
      featured: form.featured,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Produit ajouté"); setForm(empty); onChange(); }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); onChange(); }
  }

  async function toggle(p: Product, field: "active" | "featured") {
    const update = { [field]: !p[field] } as { active?: boolean; featured?: boolean };
    const { error } = await supabase.from("products").update(update).eq("id", p.id);
    if (error) toast.error(error.message);
    else onChange();
  }

  return (
    <section className="mt-6 space-y-8">
      <form onSubmit={create} className="grid gap-3 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
        <input required placeholder="Nom" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <input required type="number" placeholder="Prix (centimes)" value={form.price_cents || ""}
          onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="URL image" value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="md:col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <input type="number" placeholder="Stock" value={form.stock || ""}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <textarea placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="md:col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Mettre en avant
        </label>
        <button disabled={saving} className="md:col-span-2 rounded-full px-6 py-2 text-sm text-accent-foreground"
          style={{ background: "var(--gradient-gold)" }}>
          {saving ? "..." : "Ajouter le produit"}
        </button>
      </form>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Prix</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Actif</th>
              <th className="px-4 py-3 text-left">Vedette</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3">{formatPrice(p.price_cents)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(p, "active")} className="text-xs underline">
                    {p.active ? "Oui" : "Non"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(p, "featured")} className="text-xs underline">
                    {p.featured ? "Oui" : "Non"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(p.id)} className="text-xs text-destructive hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
