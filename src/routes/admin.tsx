import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api, BackendUser, Categorie, Commande, Design, Tissus, formatPrice } from "@/lib/api";
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
  const [tab, setTab] = useState<"commandes" | "designs" | "clients" | "tissus" | "categories">("commandes");
  const [clients, setClients] = useState<BackendUser[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [tissus, setTissus] = useState<Tissus[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/compte" });
  }, [loading, user, isAdmin, navigate]);

  async function reload() {
    if (!isAdmin) return;
    const [c, d, o, cats, tiss] = await Promise.all([
      api.users.findAll().catch(() => [] as BackendUser[]),
      api.design.findAll().catch(() => [] as Design[]),
      api.commande.findAll().catch(() => [] as Commande[]),
      api.categorie.findAll().catch(() => [] as Categorie[]),
      api.tissus.findAll().catch(() => [] as Tissus[]),
    ]);
    setClients(c.filter((u) => u.role === "CLIENT"));
    setDesigns(d);
    setCommandes(o);
    setCategories(cats);
    setTissus(tiss);
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

        <div className="mt-10 flex flex-wrap gap-2 border-b border-border">
          {(["commandes", "designs", "clients", "tissus", "categories"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize transition ${
                tab === t ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "designs" ? "Modèles" : t === "categories" ? "Catégories" : t}
            </button>
          ))}
        </div>

        {tab === "commandes" && <OrdersTable commandes={commandes} onChange={reload} />}
        {tab === "designs" && <DesignsTab designs={designs} categories={categories} tissus={tissus} onChange={reload} />}
        {tab === "clients" && <ClientsTable clients={clients} />}
        {tab === "tissus" && <TissusTab tissus={tissus} onChange={reload} />}
        {tab === "categories" && <CategoriesTab categories={categories} onChange={reload} />}
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

function DesignsTab({ designs, categories, tissus, onChange }: { designs: Design[]; categories: Categorie[]; tissus: Tissus[]; onChange: () => void }) {
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
          <select required value={form.categorieId}
            onChange={(e) => setForm({ ...form, categorieId: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Choisir une catégorie…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select required value={form.tissusId}
            onChange={(e) => setForm({ ...form, tissusId: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Choisir un tissu…</option>
            {tissus.map((t) => <option key={t.id} value={t.id}>{t.type} · {t.couleur}</option>)}
          </select>
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

function TissusTab({ tissus, onChange }: { tissus: Tissus[]; onChange: () => void }) {
  const [form, setForm] = useState({ type: "Bazin", couleur: "", texture: "", prixParMetre: "", stock: "" });
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("type", form.type);
      fd.append("couleur", form.couleur);
      fd.append("texture", form.texture);
      fd.append("prixParMetre", form.prixParMetre);
      fd.append("stock", form.stock);
      if (files) Array.from(files).forEach((f) => fd.append("files", f));
      await api.tissus.create(fd);
      toast.success("Tissu ajouté");
      setForm({ type: "Bazin", couleur: "", texture: "", prixParMetre: "", stock: "" });
      setFiles(null);
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Supprimer ce tissu ?")) return;
    try {
      await api.tissus.remove(id);
      toast.success("Tissu supprimé");
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      <form onSubmit={create} className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-medium">Ajouter un tissu</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="Bazin">Bazin</option>
            <option value="Coton">Coton</option>
            <option value="Lin">Lin</option>
          </select>
          <input required placeholder="Couleur" value={form.couleur}
            onChange={(e) => setForm({ ...form, couleur: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required placeholder="Texture" value={form.texture}
            onChange={(e) => setForm({ ...form, texture: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" placeholder="Prix par mètre (FCFA)" value={form.prixParMetre}
            onChange={(e) => setForm({ ...form, prixParMetre: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" placeholder="Stock (mètres)" value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-2 file:border-0 file:bg-transparent file:text-xs" />
        </div>
        <button disabled={saving} className="rounded-full px-6 py-2 text-sm text-accent-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}>
          {saving ? "..." : "Ajouter"}
        </button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Couleur</th>
              <th className="px-4 py-3 text-left">Texture</th>
              <th className="px-4 py-3 text-left">Prix/m</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tissus.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-muted-foreground">Aucun tissu.</td></tr>
            ) : tissus.map((t) => (
              <tr key={t.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">{t.type}</td>
                <td className="px-4 py-3">{t.couleur}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.texture}</td>
                <td className="px-4 py-3">{formatPrice(t.prixParMetre)}</td>
                <td className="px-4 py-3">{t.stock} m</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(t.id)} className="text-xs text-destructive hover:underline">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CategoriesTab({ categories, onChange }: { categories: Categorie[]; onChange: () => void }) {
  const [form, setForm] = useState({ nom: "", description: "" });
  const [saving, setSaving] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.categorie.create({ nom: form.nom, description: form.description || undefined });
      toast.success("Catégorie ajoutée");
      setForm({ nom: "", description: "" });
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number, nom: string) {
    if (!confirm(`Supprimer la catégorie "${nom}" ?`)) return;
    try {
      await api.categorie.remove(id);
      toast.success("Catégorie supprimée");
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      <form onSubmit={create} className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-medium">Ajouter une catégorie</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input required placeholder="Nom (ex: Homme, Femme, Enfant)" value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Description (optionnel)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button disabled={saving} className="rounded-full px-6 py-2 text-sm text-accent-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}>
          {saving ? "..." : "Ajouter"}
        </button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-muted-foreground">Aucune catégorie.</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3 font-medium">{c.nom}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(c.id, c.nom)} className="text-xs text-destructive hover:underline">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
