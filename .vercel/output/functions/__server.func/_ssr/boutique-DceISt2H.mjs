import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useCart, u as useAuth, a as api, f as formatPrice, T as TAILLES_STANDARD } from "./router-CFlKJ9pv.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as logo } from "./modolk-logo-Dej8hMAy.mjs";
import { e as enfantImg, h as hommeImg, f as femmeImg } from "./enfant-Uy52lC9e.mjs";
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
const categoryMap = {
  Femme: "femme",
  Homme: "homme",
  Enfant: "enfant"
};
const fallback = {
  femme: femmeImg,
  homme: hommeImg,
  enfant: enfantImg
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
function BoutiquePage() {
  const [designs, setDesigns] = reactExports.useState([]);
  const [cat, setCat] = reactExports.useState("tous");
  const [loading, setLoading] = reactExports.useState(true);
  const cart = useCart();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = reactExports.useState(false);
  const [mesures, setMesures] = reactExports.useState([]);
  const [selectedMesureId, setSelectedMesureId] = reactExports.useState(null);
  const [showMesureForm, setShowMesureForm] = reactExports.useState(false);
  const [newMesure, setNewMesure] = reactExports.useState(MESURE_EMPTY);
  const [savingMesure, setSavingMesure] = reactExports.useState(false);
  const [mesureMode, setMesureMode] = reactExports.useState("standard");
  reactExports.useEffect(() => {
    api.design.findAll().then((data) => setDesigns(data)).catch(() => toast.error("Impossible de charger les modèles.")).finally(() => setLoading(false));
  }, []);
  reactExports.useEffect(() => {
    if (!user) return;
    api.mesure.findAll(user.id).then((m) => {
      setMesures(m);
      if (m.length > 0) setSelectedMesureId(m[0].id);
    }).catch(() => {
    });
  }, [user]);
  const filtered = reactExports.useMemo(() => {
    if (cat === "tous") return designs;
    return designs.filter((d) => (categoryMap[d.categorie?.nom ?? ""] ?? "").toLowerCase() === cat);
  }, [cat, designs]);
  function getImageUrl(d) {
    if (d.medias.length > 0) {
      const url = d.medias[0].imageUrl;
      if (url.startsWith("/uploads/")) {
        return `${"https://tuwindi.app/api/modolk".replace("/api/v1", "")}${url}`;
      }
      return url;
    }
    const catKey = categoryMap[d.categorie?.nom ?? ""] ?? "femme";
    return fallback[catKey] ?? femmeImg;
  }
  async function saveMesure() {
    if (!user) return;
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
      setSelectedMesureId(created.id);
      setShowMesureForm(false);
      setNewMesure(MESURE_EMPTY);
      toast.success("Mesures enregistrées.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingMesure(false);
    }
  }
  async function checkout(e) {
    e.preventDefault();
    if (!user) {
      navigate({
        to: "/auth"
      });
      return;
    }
    if (cart.items.length === 0) return;
    if (!selectedMesureId) {
      toast.error("Veuillez sélectionner ou créer vos mesures.");
      return;
    }
    setCheckingOut(true);
    try {
      await api.commande.create({
        utilisateurId: user.id,
        tenues: cart.items.map((i) => ({
          modelId: i.designId,
          tissusId: i.tissusId,
          mesureId: selectedMesureId,
          quantite: i.quantity,
          optionIds: []
        }))
      });
      cart.clear();
      toast.success("Commande passée avec succès !");
      navigate({
        to: "/compte"
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCheckingOut(false);
    }
  }
  const cats = ["tous", "femme", "homme", "enfant"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "MODOLK", className: "h-9 w-9 object-contain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tracking-[0.25em] text-sm", children: "MODOLK" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/compte", className: "text-muted-foreground hover:text-foreground", children: "Mon compte" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-border px-3 py-1.5 text-xs", children: [
          "Panier · ",
          cart.count,
          " · ",
          formatPrice(cart.total)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-6xl px-6 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs tracking-[0.3em] text-accent", children: "BOUTIQUE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl font-light md:text-5xl", children: "Notre collection" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex flex-wrap gap-2", children: cats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCat(c), className: `rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition ${cat === c ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:text-foreground"}`, children: c }, c)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-6 md:grid-cols-3", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chargement…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Aucun modèle pour cette catégorie." }) : filtered.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "overflow-hidden rounded-2xl border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/5] overflow-hidden bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: getImageUrl(d), alt: d.nom, loading: "lazy", className: "h-full w-full object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-[0.25em] text-accent", children: [
            d.categorie?.nom ?? "—",
            " · ",
            d.tissus?.type
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-lg font-light", children: d.nom }),
          d.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground line-clamp-2", children: d.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Tissu : ",
            d.tissus?.couleur,
            " · ",
            d.tissus?.texture
          ] }),
          d.options.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Options : ",
            d.options.map((o) => o.nom).join(", ")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-medium", children: formatPrice(d.prixBase) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              cart.add({
                designId: d.id,
                tissusId: d.tissusId,
                name: d.nom,
                price: d.prixBase,
                image_url: d.medias[0]?.imageUrl ?? null
              });
              toast.success(`${d.nom} ajouté au panier`);
            }, className: "rounded-full px-4 py-1.5 text-xs font-medium text-accent-foreground", style: {
              background: "var(--gradient-gold)"
            }, children: "Ajouter" })
          ] })
        ] })
      ] }, d.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-20 rounded-2xl border border-border bg-card p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-light", children: "Mon panier" }),
        cart.items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Votre panier est vide." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 divide-y divide-border", children: cart.items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-4 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: i.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: formatPrice(i.price) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, value: i.quantity, onChange: (e) => cart.setQty(i.designId, Number(e.target.value)), className: "w-16 rounded-md border border-input bg-background px-2 py-1 text-sm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-28 text-right text-sm", children: formatPrice(i.price * i.quantity) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => cart.remove(i.designId), className: "text-xs text-muted-foreground hover:text-foreground", children: "Retirer" })
            ] })
          ] }, i.designId)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between border-t border-border pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Total estimé" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: formatPrice(cart.total) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: checkout, className: "mt-8 space-y-5", children: user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-light", children: "Mesures pour la commande" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowMesureForm(!showMesureForm), className: "text-xs text-accent hover:underline", children: showMesureForm ? "Annuler" : mesures.length === 0 ? "Créer mes mesures" : "Nouvelle mesure" })
              ] }),
              mesures.length > 0 && !showMesureForm && /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: selectedMesureId ?? "", onChange: (e) => setSelectedMesureId(Number(e.target.value)), className: "mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", children: mesures.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: m.id, children: [
                m.label,
                " ",
                m.tailleStandard ? `(${m.tailleStandard})` : "(sur mesure)"
              ] }, m.id)) }),
              (showMesureForm || mesures.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl border border-border bg-background p-4 space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, placeholder: "Nom de la mesure (ex: Tenue mariage)", value: newMesure.label, onChange: (e) => setNewMesure({
                  ...newMesure,
                  label: e.target.value
                }), className: "w-full rounded-md border border-input bg-card px-3 py-2 text-sm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMesureMode("standard"), className: `flex-1 rounded-full border px-3 py-1.5 text-xs transition ${mesureMode === "standard" ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"}`, children: "Taille standard" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMesureMode("complete"), className: `flex-1 rounded-full border px-3 py-1.5 text-xs transition ${mesureMode === "complete" ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"}`, children: "Sur mesure" })
                ] }),
                mesureMode === "standard" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Taille" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newMesure.tailleStandard, onChange: (e) => setNewMesure({
                    ...newMesure,
                    tailleStandard: e.target.value
                  }), className: "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choisir une taille…" }),
                    TAILLES_STANDARD.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Entrez vos mesures en centimètres (sauf poids en kg)." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-3", children: ["poitrine", "epaule", "cou", "hanche", "ventre", "poignet", "longueurBras", "longueurJambe", "poids"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: k }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.1", min: 0, value: newMesure[k] || "", onChange: (e) => setNewMesure({
                      ...newMesure,
                      [k]: parseFloat(e.target.value) || 0
                    }), className: "mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm" })
                  ] }, k)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: savingMesure || !newMesure.label, onClick: saveMesure, className: "rounded-full px-5 py-2 text-xs text-accent-foreground disabled:opacity-50", style: {
                  background: "var(--gradient-gold)"
                }, children: savingMesure ? "..." : "Enregistrer les mesures" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: checkingOut || !selectedMesureId, className: "w-full rounded-full px-6 py-3 text-sm font-medium text-accent-foreground shadow-[var(--shadow-gold)] disabled:opacity-60", style: {
              background: "var(--gradient-gold)"
            }, children: checkingOut ? "..." : "Valider la commande" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate({
            to: "/auth"
          }), className: "w-full rounded-full px-6 py-3 text-sm font-medium text-accent-foreground", style: {
            background: "var(--gradient-gold)"
          }, children: "Se connecter pour commander" }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  BoutiquePage as component
};
