import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api, BackendUser, Commande, Design, formatPrice } from "@/lib/api";
import { toast } from "sonner";
import logo from "@/assets/modolk-logo.png";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MODOLK" }] }),
});

const STATUTS = ["EnAttente", "Payer", "EnProduction", "Pret", "Livre"] as const;
const STATUT_LABEL: Record<string, string> = {
  EnAttente: "En attente",
  Payer: "Payée",
  EnProduction: "En production",
  Pret: "Prête",
  Livre: "Livrée",
};

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"commandes" | "designs" | "clients">("commandes");
  const [clients, setClients] = useState<BackendUser[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/compte" });
  }, [loading, user, isAdmin, navigate]);

  async function reload() {
    if (!isAdmin) return;
    const [c, d, o] = await Promise.all([
      api.users.findAll().catch(() => [] as BackendUser[]),
      api.design.findAll().catch(() => [] as Design[]),
      api.commande.findAll().catch(() => [] as Commande[]),
    ]);
    setClients(c.filter((u) => u.role === "CLIENT"));
    setDesigns(d);
    setCommandes(o);
  }

  useEffect(() => { reload(); }, [isAdmin]);

  if (loading || (user && !isAdmin)) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Chargement…</div>;
  }
  if (!user) return null;

  const totalCA = commandes.reduce((s, o) => s + o.totalPrice, 0);

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
          <Stat label="Modèles" value={designs.length} />
          <Stat label="Commandes" value={commandes.length} />
          <Stat label="CA total" value={formatPrice(totalCA)} />
        </div>

        <div className="mt-10 flex gap-2 border-b border-border">
          {(["commandes", "designs", "clients"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize transition ${
                tab === t ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "designs" ? "Modèles" : t}
            </button>
          ))}
        </div>

        {tab === "commandes" && <OrdersTable commandes={commandes} onChange={reload} />}
        {tab === "designs" && <DesignsTab designs={designs} onChange={reload} />}
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

function OrdersTable({ commandes, onChange }: { commandes: Commande[]; onChange: () => void }) {
  async function updateStatut(id: number, statut: string) {
    try {
      await api.commande.updateStatut(id, statut);
      toast.success("Statut mis à jour");
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <section className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Client ID</th>
            <th className="px-4 py-3 text-left">Tenues</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {commandes.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-muted-foreground">Aucune commande.</td></tr>
          ) : (
            commandes.map((o) => (
              <tr key={o.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">#{o.id}</td>
                <td className="px-4 py-3">{new Date(o.dateCommande).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 text-muted-foreground">Client #{o.utilisateurId}</td>
                <td className="px-4 py-3">{o.tenues.length}</td>
                <td className="px-4 py-3">{formatPrice(o.totalPrice)}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.statutCommande}
                    onChange={(e) => updateStatut(o.id, e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    {STATUTS.map((s) => (
                      <option key={s} value={s}>{STATUT_LABEL[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

function ClientsTable({ clients }: { clients: BackendUser[] }) {
  return (
    <section className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left">Nom</th>
            <th className="px-4 py-3 text-left">Prénom</th>
            <th className="px-4 py-3 text-left">E-mail</th>
            <th className="px-4 py-3 text-left">Téléphone</th>
            <th className="px-4 py-3 text-left">Adresse</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-muted-foreground">Aucun client.</td></tr>
          ) : (
            clients.map((c) => (
              <tr key={c.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">{c.nom}</td>
                <td className="px-4 py-3">{c.prenom}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.telephone || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.adresse || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

function DesignsTab({ designs, onChange }: { designs: Design[]; onChange: () => void }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [form, setForm] = useState({
    nom: "", description: "", prixBase: "", nombreDeMetre: "", categorieId: "", tissusId: "",
  });
  const [saving, setSaving] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) { toast.error("Ajoutez au moins une photo."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nom", form.nom);
      fd.append("description", form.description);
      fd.append("prixBase", form.prixBase);
      fd.append("nombreDeMetre", form.nombreDeMetre);
      fd.append("categorieId", form.categorieId);
      fd.append("tissusId", form.tissusId);
      Array.from(files).forEach((f) => fd.append("files", f));

      await api.design.create(fd);
      toast.success("Modèle ajouté");
      setForm({ nom: "", description: "", prixBase: "", nombreDeMetre: "", categorieId: "", tissusId: "" });
      setFiles(null);
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number, nom: string) {
    if (!confirm(`Supprimer le modèle "${nom}" ?`)) return;
    try {
      await api.design.remove(id);
      toast.success("Modèle supprimé");
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      {/* Formulaire ajout */}
      <form onSubmit={create} className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-medium">Ajouter un modèle</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input required placeholder="Nom du modèle" value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" placeholder="Prix de base (FCFA)" value={form.prixBase}
            onChange={(e) => setForm({ ...form, prixBase: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" placeholder="ID catégorie" value={form.categorieId}
            onChange={(e) => setForm({ ...form, categorieId: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" placeholder="ID tissu" value={form.tissusId}
            onChange={(e) => setForm({ ...form, tissusId: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" placeholder="Nombre de mètres tissu" value={form.nombreDeMetre}
            onChange={(e) => setForm({ ...form, nombreDeMetre: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-2 file:border-0 file:bg-transparent file:text-xs" />
        </div>
        <textarea placeholder="Description (optionnel)" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <button disabled={saving}
          className="rounded-full px-6 py-2 text-sm text-accent-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}>
          {saving ? "..." : "Ajouter le modèle"}
        </button>
      </form>

      {/* Table des designs */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Tissu</th>
              <th className="px-4 py-3 text-left">Prix base</th>
              <th className="px-4 py-3 text-left">Photos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {designs.map((d) => (
              <tr key={d.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">{d.nom}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.categorie?.nom ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.tissus?.type} · {d.tissus?.couleur}</td>
                <td className="px-4 py-3">{formatPrice(d.prixBase)}</td>
                <td className="px-4 py-3">{d.medias.length}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(d.id, d.nom)} className="text-xs text-destructive hover:underline">
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
