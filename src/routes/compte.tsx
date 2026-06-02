import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/hooks/use-cart";
import logo from "@/assets/modolk-logo.png";

export const Route = createFileRoute("/compte")({
  component: ComptePage,
  head: () => ({ meta: [{ title: "Mon compte — MODOLK" }] }),
});

interface Order { id: string; status: string; total_cents: number; created_at: string; shipping_address: string | null; }

function ComptePage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, phone, address").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
        });
      });
    supabase.from("orders").select("id, status, total_cents, created_at, shipping_address")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profil mis à jour.");
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="MODOLK" className="h-9 w-9 object-contain" />
          <span className="tracking-[0.25em] text-sm">MODOLK</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/boutique" className="text-muted-foreground hover:text-foreground">Boutique</Link>
          {isAdmin && (
            <Link to="/admin" className="rounded-full border border-border px-4 py-2 hover:bg-secondary">
              Espace admin
            </Link>
          )}
          <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="text-muted-foreground hover:text-foreground">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-xs tracking-[0.3em] text-accent">MON COMPTE</div>
        <h1 className="mt-3 text-4xl font-light">Bienvenue{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h1>
        <p className="mt-2 text-muted-foreground text-sm">{user.email}</p>

        <form onSubmit={save} className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-lg font-light">Mes informations</h2>
          <div>
            <label className="text-xs tracking-wide text-muted-foreground">Nom complet</label>
            <input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>
          <div>
            <label className="text-xs tracking-wide text-muted-foreground">Téléphone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>
          <div>
            <label className="text-xs tracking-wide text-muted-foreground">Adresse de livraison</label>
            <textarea
              rows={3}
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>
          <button
            disabled={saving}
            className="rounded-full px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
            style={{ background: "var(--gradient-gold)" }}
          >
            {saving ? "..." : "Enregistrer"}
          </button>
        </form>

        <section className="mt-10 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-lg font-light">Mes commandes</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
          ) : (
            <ul className="mt-6 divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <div>{new Date(o.created_at).toLocaleDateString("fr-FR")}</div>
                    <div className="text-xs text-muted-foreground">{o.shipping_address || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div>{formatPrice(o.total_cents)}</div>
                    <div className="text-xs uppercase tracking-wider text-accent">{o.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
