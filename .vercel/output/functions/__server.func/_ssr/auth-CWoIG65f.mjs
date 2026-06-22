import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./router-CFlKJ9pv.mjs";
import { t as toast } from "../_libs/sonner.mjs";
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
const COUNTRIES = [
  { code: "ML", name: "Mali", dial: "+223", flag: "🇲🇱" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "ES", name: "Espagne", dial: "+34", flag: "🇪🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "US", name: "États-Unis", dial: "+1", flag: "🇺🇸" },
  { code: "BE", name: "Belgique", dial: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", dial: "+41", flag: "🇨🇭" },
  { code: "DE", name: "Allemagne", dial: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italie", dial: "+39", flag: "🇮🇹" },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { code: "DZ", name: "Algérie", dial: "+213", flag: "🇩🇿" },
  { code: "TN", name: "Tunisie", dial: "+216", flag: "🇹🇳" },
  { code: "SN", name: "Sénégal", dial: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "NE", name: "Niger", dial: "+227", flag: "🇳🇪" },
  { code: "GN", name: "Guinée", dial: "+224", flag: "🇬🇳" },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "BJ", name: "Bénin", dial: "+229", flag: "🇧🇯" },
  { code: "CM", name: "Cameroun", dial: "+237", flag: "🇨🇲" },
  { code: "GA", name: "Gabon", dial: "+241", flag: "🇬🇦" },
  { code: "CD", name: "RD Congo", dial: "+243", flag: "🇨🇩" },
  { code: "CG", name: "Congo", dial: "+242", flag: "🇨🇬" },
  { code: "MR", name: "Mauritanie", dial: "+222", flag: "🇲🇷" }
];
const DEFAULT_COUNTRY = COUNTRIES[0];
function AuthPage() {
  const navigate = useNavigate();
  const {
    login,
    register,
    user,
    loading
  } = useAuth();
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [nom, setNom] = reactExports.useState("");
  const [prenom, setPrenom] = reactExports.useState("");
  const [countryCode, setCountryCode] = reactExports.useState(DEFAULT_COUNTRY.code);
  const [phoneLocal, setPhoneLocal] = reactExports.useState("");
  const [adresse, setAdresse] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  if (!loading && user) {
    navigate({
      to: "/compte"
    });
    return null;
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const country = COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY;
        const cleaned = phoneLocal.replace(/\D/g, "");
        const telephone = cleaned ? `${country.dial}${cleaned}` : "";
        await register({
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim().toLowerCase(),
          telephone,
          motDePasse: password,
          adresse: adresse.trim() || void 0
        });
        toast.success("Compte créé. Bienvenue !");
      } else {
        await login(email.trim().toLowerCase(), password);
        toast.success("Bienvenue.");
      }
      navigate({
        to: "/compte"
      });
    } catch (err) {
      const msg = err.message ?? "Une erreur est survenue.";
      if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("mot de passe")) {
        toast.error("E-mail ou mot de passe incorrect.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-6 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mb-8 block text-center text-xs tracking-[0.3em] text-muted-foreground hover:text-foreground", children: "← MODOLK" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-gold)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light", children: mode === "signin" ? "Se connecter" : "Créer un compte" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: mode === "signin" ? "Accède à ton espace MODOLK." : "Rejoins l'univers MODOLK." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-6 space-y-4", children: [
        mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Nom" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: nom, onChange: (e) => setNom(e.target.value), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Prénom" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: prenom, onChange: (e) => setPrenom(e.target.value), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Téléphone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: countryCode, onChange: (e) => setCountryCode(e.target.value), className: "rounded-md border border-input bg-background px-2 py-2 text-sm outline-none focus:border-ring", children: COUNTRIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.code, children: [
                c.flag,
                " ",
                c.name,
                " (",
                c.dial,
                ")"
              ] }, c.code)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", inputMode: "numeric", placeholder: "Numéro", required: true, value: phoneLocal, onChange: (e) => setPhoneLocal(e.target.value), className: "flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Adresse (optionnel)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: adresse, onChange: (e) => setAdresse(e.target.value), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs tracking-wide text-muted-foreground", children: "Mot de passe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: busy, className: "w-full rounded-full px-6 py-3 text-sm font-medium tracking-wide text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:opacity-60", style: {
          background: "var(--gradient-gold)"
        }, children: busy ? "..." : mode === "signin" ? "Se connecter" : "Créer mon compte" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center text-sm text-muted-foreground", children: mode === "signin" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Pas encore de compte ?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode("signup"), className: "text-accent hover:underline", children: "Créer un compte" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Déjà inscrit ?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode("signin"), className: "text-accent hover:underline", children: "Se connecter" })
      ] }) })
    ] })
  ] }) });
}
export {
  AuthPage as component
};
