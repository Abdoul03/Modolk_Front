import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, f as formatPrice, a as api } from "./router-CFlKJ9pv.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as logo } from "./modolk-logo-Dej8hMAy.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
const STATUTS = ["EnAttente", "Payer", "EnProduction", "Pret", "Livre"];
const STATUT_LABEL = {
  EnAttente: "En attente",
  Payer: "Payée",
  EnProduction: "En production",
  Pret: "Prête",
  Livre: "Livrée"
};
function AdminPage() {
  const {
    user,
    isAdmin,
    loading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = reactExports.useState("commandes");
  const [clients, setClients] = reactExports.useState([]);
  const [designs, setDesigns] = reactExports.useState([]);
  const [commandes, setCommandes] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [tissus, setTissus] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) navigate({
      to: "/auth"
    });
    else if (!isAdmin) navigate({
      to: "/compte"
    });
  }, [loading, user, isAdmin, navigate]);
  async function reload() {
    if (!isAdmin) return;
    const [c, d, o, cats, tiss] = await Promise.all([api.users.findAll().catch(() => []), api.design.findAll().catch(() => []), api.commande.findAll().catch(() => []), api.categorie.findAll().catch(() => []), api.tissus.findAll().catch(() => [])]);
    setClients(c.filter((u) => u.role === "CLIENT"));
    setDesigns(d);
    setCommandes(o);
    setCategories(cats);
    setTissus(tiss);
  }
  reactExports.useEffect(() => {
    reload();
  }, [isAdmin]);
  if (loading || user && !isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Chargement…" });
  }
  if (!user) return null;
  const totalCA = commandes.reduce((s, o) => s + o.totalPrice, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "MODOLK", className: "h-9 w-9 object-contain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tracking-[0.25em] text-sm", children: "MODOLK · ADMIN" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/boutique", className: "text-muted-foreground hover:text-foreground", children: "Boutique" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/compte", className: "text-muted-foreground hover:text-foreground", children: "Mon compte" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          signOut();
          navigate({
            to: "/"
          });
        }, className: "text-muted-foreground hover:text-foreground", children: "Déconnexion" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-6xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs tracking-[0.3em] text-accent", children: "TABLEAU DE BORD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-light", children: "Espace administrateur" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Clients", value: clients.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Modèles", value: designs.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Commandes", value: commandes.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "CA total", value: formatPrice(totalCA) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 flex flex-wrap gap-2 border-b border-border", children: ["commandes", "designs", "clients", "tissus", "categories"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: `px-4 py-2 text-sm capitalize transition ${tab === t ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: t === "designs" ? "Modèles" : t === "categories" ? "Catégories" : t }, t)) }),
      tab === "commandes" && /* @__PURE__ */ jsxRuntimeExports.jsx(OrdersTable, { commandes, onChange: reload }),
      tab === "designs" && /* @__PURE__ */ jsxRuntimeExports.jsx(DesignsTab, { designs, categories, tissus, onChange: reload }),
      tab === "clients" && /* @__PURE__ */ jsxRuntimeExports.jsx(ClientsTable, { clients }),
      tab === "tissus" && /* @__PURE__ */ jsxRuntimeExports.jsx(TissusTab, { tissus, onChange: reload }),
      tab === "categories" && /* @__PURE__ */ jsxRuntimeExports.jsx(CategoriesTab, { categories, onChange: reload })
    ] })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs tracking-[0.25em] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-2xl font-light", children: value })
  ] });
}
function OrdersTable({
  commandes,
  onChange
}) {
  async function updateStatut(id, statut) {
    try {
      await api.commande.updateStatut(id, statut);
      toast.success("Statut mis à jour");
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 overflow-x-auto rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "#" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Client ID" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Tenues" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Total" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Statut" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: commandes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "p-8 text-muted-foreground", children: "Aucune commande." }) }) : commandes.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-mono text-xs", children: [
        "#",
        o.id
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: new Date(o.dateCommande).toLocaleDateString("fr-FR") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-muted-foreground", children: [
        "Client #",
        o.utilisateurId
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: o.tenues.length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: formatPrice(o.totalPrice) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: o.statutCommande, onChange: (e) => updateStatut(o.id, e.target.value), className: "rounded-md border border-input bg-background px-2 py-1 text-xs", children: STATUTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: STATUT_LABEL[s] }, s)) }) })
    ] }, o.id)) })
  ] }) });
}
function ClientsTable({
  clients
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 overflow-x-auto rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Nom" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Prénom" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "E-mail" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Téléphone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Adresse" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: clients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "p-8 text-muted-foreground", children: "Aucun client." }) }) : clients.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: c.nom }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: c.prenom }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.email }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.telephone || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.adresse || "—" })
    ] }, c.id)) })
  ] }) });
}
function DesignsTab({
  designs,
  categories,
  tissus,
  onChange
}) {
  const [files, setFiles] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    nom: "",
    description: "",
    prixBase: "",
    nombreDeMetre: "",
    categorieId: "",
    tissusId: ""
  });
  const [saving, setSaving] = reactExports.useState(false);
  async function create(e) {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error("Ajoutez au moins une photo.");
      return;
    }
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
      setForm({
        nom: "",
        description: "",
        prixBase: "",
        nombreDeMetre: "",
        categorieId: "",
        tissusId: ""
      });
      setFiles(null);
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(id, nom) {
    if (!confirm(`Supprimer le modèle "${nom}" ?`)) return;
    try {
      await api.design.remove(id);
      toast.success("Modèle supprimé");
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: create, className: "rounded-2xl border border-border bg-card p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Ajouter un modèle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, placeholder: "Nom du modèle", value: form.nom, onChange: (e) => setForm({
          ...form,
          nom: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "number", placeholder: "Prix de base (FCFA)", value: form.prixBase, onChange: (e) => setForm({
          ...form,
          prixBase: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.categorieId, onChange: (e) => setForm({
          ...form,
          categorieId: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choisir une catégorie…" }),
          categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.nom }, c.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.tissusId, onChange: (e) => setForm({
          ...form,
          tissusId: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choisir un tissu…" }),
          tissus.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t.id, children: [
            t.type,
            " · ",
            t.couleur
          ] }, t.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "number", placeholder: "Nombre de mètres tissu", value: form.nombreDeMetre, onChange: (e) => setForm({
          ...form,
          nombreDeMetre: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => setFiles(e.target.files), className: "rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-2 file:border-0 file:bg-transparent file:text-xs" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { placeholder: "Description (optionnel)", value: form.description, onChange: (e) => setForm({
        ...form,
        description: e.target.value
      }), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: saving, className: "rounded-full px-6 py-2 text-sm text-accent-foreground disabled:opacity-60", style: {
        background: "var(--gradient-gold)"
      }, children: saving ? "..." : "Ajouter le modèle" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Nom" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Catégorie" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Tissu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Prix base" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Photos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: designs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: d.nom }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: d.categorie?.nom ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-muted-foreground", children: [
          d.tissus?.type,
          " · ",
          d.tissus?.couleur
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: formatPrice(d.prixBase) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: d.medias.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(d.id, d.nom), className: "text-xs text-destructive hover:underline", children: "Supprimer" }) })
      ] }, d.id)) })
    ] }) })
  ] });
}
function TissusTab({
  tissus,
  onChange
}) {
  const [form, setForm] = reactExports.useState({
    type: "Bazin",
    couleur: "",
    texture: "",
    prixParMetre: "",
    stock: ""
  });
  const [files, setFiles] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  async function create(e) {
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
      setForm({
        type: "Bazin",
        couleur: "",
        texture: "",
        prixParMetre: "",
        stock: ""
      });
      setFiles(null);
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(id) {
    if (!confirm("Supprimer ce tissu ?")) return;
    try {
      await api.tissus.remove(id);
      toast.success("Tissu supprimé");
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: create, className: "rounded-2xl border border-border bg-card p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Ajouter un tissu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.type, onChange: (e) => setForm({
          ...form,
          type: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bazin", children: "Bazin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Coton", children: "Coton" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Lin", children: "Lin" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, placeholder: "Couleur", value: form.couleur, onChange: (e) => setForm({
          ...form,
          couleur: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, placeholder: "Texture", value: form.texture, onChange: (e) => setForm({
          ...form,
          texture: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "number", placeholder: "Prix par mètre (FCFA)", value: form.prixParMetre, onChange: (e) => setForm({
          ...form,
          prixParMetre: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "number", placeholder: "Stock (mètres)", value: form.stock, onChange: (e) => setForm({
          ...form,
          stock: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => setFiles(e.target.files), className: "rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-2 file:border-0 file:bg-transparent file:text-xs" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: saving, className: "rounded-full px-6 py-2 text-sm text-accent-foreground disabled:opacity-60", style: {
        background: "var(--gradient-gold)"
      }, children: saving ? "..." : "Ajouter" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Couleur" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Texture" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Prix/m" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: tissus.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "p-8 text-muted-foreground", children: "Aucun tissu." }) }) : tissus.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: t.type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: t.couleur }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: t.texture }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: formatPrice(t.prixParMetre) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          t.stock,
          " m"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(t.id), className: "text-xs text-destructive hover:underline", children: "Supprimer" }) })
      ] }, t.id)) })
    ] }) })
  ] });
}
function CategoriesTab({
  categories,
  onChange
}) {
  const [form, setForm] = reactExports.useState({
    nom: "",
    description: ""
  });
  const [saving, setSaving] = reactExports.useState(false);
  async function create(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.categorie.create({
        nom: form.nom,
        description: form.description || void 0
      });
      toast.success("Catégorie ajoutée");
      setForm({
        nom: "",
        description: ""
      });
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(id, nom) {
    if (!confirm(`Supprimer la catégorie "${nom}" ?`)) return;
    try {
      await api.categorie.remove(id);
      toast.success("Catégorie supprimée");
      onChange();
    } catch (err) {
      toast.error(err.message);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: create, className: "rounded-2xl border border-border bg-card p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Ajouter une catégorie" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, placeholder: "Nom (ex: Homme, Femme, Enfant)", value: form.nom, onChange: (e) => setForm({
          ...form,
          nom: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Description (optionnel)", value: form.description, onChange: (e) => setForm({
          ...form,
          description: e.target.value
        }), className: "rounded-md border border-input bg-background px-3 py-2 text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: saving, className: "rounded-full px-6 py-2 text-sm text-accent-foreground disabled:opacity-60", style: {
        background: "var(--gradient-gold)"
      }, children: saving ? "..." : "Ajouter" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Nom" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "p-8 text-muted-foreground", children: "Aucune catégorie." }) }) : categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: c.nom }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.description || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(c.id, c.nom), className: "text-xs text-destructive hover:underline", children: "Supprimer" }) })
      ] }, c.id)) })
    ] }) })
  ] });
}
export {
  AdminPage as component
};
