import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as api, f as formatPrice, T as TAILLES_STANDARD } from "./router-CFlKJ9pv.mjs";
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
const STATUT_LABEL = {
  EnAttente: "En attente",
  Payer: "Payée",
  EnProduction: "En production",
  Pret: "Prête",
  Livre: "Livrée"
};
const MESURE_EMPTY = {
  label: "",
  tailleStandard: "",
  poitrine: 0,
  poids: 0,
  epaule: 0,
  longueurBras: 0,
  longueurJambe: 0,
  cou: 0,
  hanche: 0,
  poignet: 0,
  ventre: 0
};
function ComptePage() {
  const {
    user,
    isAdmin,
    loading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = reactExports.useState({
    nom: "",
    prenom: "",
    telephone: "",
    adresse: ""
  });
  const [saving, setSaving] = reactExports.useState(false);
  const [commandes, setCommandes] = reactExports.useState([]);
  const [mesures, setMesures] = reactExports.useState([]);
  const [newMesure, setNewMesure] = reactExports.useState(MESURE_EMPTY);
  const [savingMesure, setSavingMesure] = reactExports.useState(false);
  const [showMesureForm, setShowMesureForm] = reactExports.useState(false);
  const [mesureMode, setMesureMode] = reactExports.useState("standard");
  const [tab, setTab] = reactExports.useState("profil");
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    setProfile({
      nom: user.nom ?? "",
      prenom: user.prenom ?? "",
      telephone: user.telephone ?? "",
      adresse: user.adresse ?? ""
    });
    api.commande.findUserCommandes(user.id).then((c) => setCommandes(c)).catch(() => {
    });
    api.mesure.findAll(user.id).then((m) => setMesures(m)).catch(() => {
    });
  }, [user]);
  async function saveProfile(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await api.users.update(user.id, {
        nom: profile.nom,
        prenom: profile.prenom,
        telephone: profile.telephone,
        adresse: profile.adresse || void 0
      });
      toast.success("Profil mis à jour.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }
  async function createMesure() {
    if (!user || !newMesure.label) return;
    setSavingMesure(true);
    try {
      const payload = {
        label: newMesure.label
      };
      if (mesureMode === "standard") {
        if (!newMesure.tailleStandard) {
          toast.error("Sélectionnez une taille.");
          setSavingMesure(false);
          return;
        }
        payload.tailleStandard = newMesure.tailleStandard;
      } else {
        payload.poitrine = newMesure.poitrine || void 0;
        payload.poids = newMesure.poids || void 0;
        payload.epaule = newMesure.epaule || void 0;
        payload.longueurBras = newMesure.longueurBras || void 0;
        payload.longueurJambe = newMesure.longueurJambe || void 0;
        payload.cou = newMesure.cou || void 0;
        payload.hanche = newMesure.hanche || void 0;
        payload.poignet = newMesure.poignet || void 0;
        payload.ventre = newMesure.ventre || void 0;
      }
      const created = await api.mesure.create(user.id, payload);
      setMesures((prev) => [...prev, created]);
      setNewMesure(MESURE_EMPTY);
      setShowMesureForm(false);
      toast.success("Mesures ajoutées.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingMesure(false);
    }
  }
  async function deleteMesure(mesureId) {
    if (!user) return;
    if (!confirm("Supprimer cette mesure ?")) return;
    try {
      await api.mesure.remove(mesureId, user.id);
      setMesures((prev) => prev.filter((m) => m.id !== mesureId));
      toast.success("Mesure supprimée.");
    } catch (err) {
      toast.error(err.message);
    }
  }
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Chargement…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-5xl items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "MODOLK", className: "h-9 w-9 object-contain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tracking-[0.25em] text-sm", children: "MODOLK" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/boutique", className: "text-muted-foreground hover:text-foreground", children: "Boutique" }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin", className: "rounded-full border border-border px-4 py-2 hover:bg-secondary", children: "Espace admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          signOut();
          navigate({
            to: "/"
          });
        }, className: "text-muted-foreground hover:text-foreground", children: "Déconnexion" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs tracking-[0.3em] text-accent", children: "MON COMPTE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 text-4xl font-light", children: [
        "Bienvenue",
        user.prenom ? `, ${user.prenom}` : "",
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-sm", children: user.email }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex gap-1 border-b border-border", children: ["profil", "commandes", "mesures"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: `px-4 py-2 text-sm capitalize transition ${tab === t ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: t === "mesures" ? "Mes mesures" : t === "commandes" ? "Mes commandes" : "Profil" }, t)) }),
      tab === "profil" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveProfile, className: "mt-8 space-y-5 rounded-2xl border border-border bg-card p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-light", children: "Mes informations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Nom" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: profile.nom, onChange: (e) => setProfile({
              ...profile,
              nom: e.target.value
            }), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Prénom" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: profile.prenom, onChange: (e) => setProfile({
              ...profile,
              prenom: e.target.value
            }), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Téléphone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: profile.telephone, onChange: (e) => setProfile({
            ...profile,
            telephone: e.target.value
          }), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Adresse de livraison" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 3, value: profile.adresse, onChange: (e) => setProfile({
            ...profile,
            adresse: e.target.value
          }), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: saving, className: "rounded-full px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-[var(--shadow-gold)] disabled:opacity-60", style: {
          background: "var(--gradient-gold)"
        }, children: saving ? "..." : "Enregistrer" })
      ] }),
      tab === "commandes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-2xl border border-border bg-card p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-light", children: "Mes commandes" }),
        commandes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Aucune commande pour le moment." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 divide-y divide-border", children: commandes.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-4 py-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Commande #",
              o.id
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              new Date(o.dateCommande).toLocaleDateString("fr-FR"),
              " · ",
              o.tenues.length,
              " tenue(s)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: formatPrice(o.totalPrice) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-accent", children: STATUT_LABEL[o.statutCommande] ?? o.statutCommande })
          ] })
        ] }, o.id)) })
      ] }),
      tab === "mesures" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-light", children: "Mes mesures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowMesureForm(!showMesureForm), className: "text-xs text-accent hover:underline", children: showMesureForm ? "Annuler" : "Ajouter une mesure" })
        ] }),
        showMesureForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Nouvelle mesure" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, placeholder: "Nom (ex: Tenue mariage)", value: newMesure.label, onChange: (e) => setNewMesure({
            ...newMesure,
            label: e.target.value
          }), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMesureMode("standard"), className: `flex-1 rounded-full border px-3 py-1.5 text-xs transition ${mesureMode === "standard" ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"}`, children: "Taille standard" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMesureMode("complete"), className: `flex-1 rounded-full border px-3 py-1.5 text-xs transition ${mesureMode === "complete" ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"}`, children: "Sur mesure" })
          ] }),
          mesureMode === "standard" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Taille" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newMesure.tailleStandard, onChange: (e) => setNewMesure({
              ...newMesure,
              tailleStandard: e.target.value
            }), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choisir une taille…" }),
              TAILLES_STANDARD.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Toutes les valeurs en centimètres, sauf le poids (kg)." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-3", children: ["poitrine", "epaule", "cou", "hanche", "ventre", "poignet", "longueurBras", "longueurJambe", "poids"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: k }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.1", min: 0, value: newMesure[k] || "", onChange: (e) => setNewMesure({
                ...newMesure,
                [k]: parseFloat(e.target.value) || 0
              }), className: "mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" })
            ] }, k)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: savingMesure || !newMesure.label, onClick: createMesure, className: "rounded-full px-5 py-2 text-xs text-accent-foreground disabled:opacity-50", style: {
            background: "var(--gradient-gold)"
          }, children: savingMesure ? "..." : "Enregistrer" })
        ] }),
        mesures.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Aucune mesure enregistrée. Ajoutez vos mesures pour pouvoir commander sur mesure." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: mesures.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: m.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMesure(m.id), className: "text-xs text-destructive hover:underline", children: "Supprimer" })
          ] }),
          m.tailleStandard ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Taille standard : " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: m.tailleStandard })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground md:grid-cols-5", children: ["poitrine", "epaule", "cou", "hanche", "ventre", "poignet", "longueurBras", "longueurJambe", "poids"].map((k) => m[k] != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-wider", children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-foreground", children: [
              m[k],
              " ",
              k === "poids" ? "kg" : "cm"
            ] })
          ] }, k)) })
        ] }, m.id)) })
      ] })
    ] })
  ] });
}
export {
  ComptePage as component
};
