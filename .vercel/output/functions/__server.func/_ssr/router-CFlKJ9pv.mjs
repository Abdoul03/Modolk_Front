import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
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
const appCss = "/assets/styles-CkdsykyD.css";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const Ctx$1 = reactExports.createContext(null);
const KEY = "modolk_cart_v2";
function CartProvider({ children }) {
  const [items, setItems] = reactExports.useState([]);
  reactExports.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);
  const value = {
    items,
    add: (i) => setItems((cur) => {
      const ex = cur.find((c) => c.designId === i.designId && c.tissusId === i.tissusId);
      if (ex) return cur.map((c) => c.designId === i.designId && c.tissusId === i.tissusId ? { ...c, quantity: c.quantity + 1 } : c);
      return [...cur, { ...i, quantity: 1 }];
    }),
    remove: (designId) => setItems((cur) => cur.filter((c) => c.designId !== designId)),
    setQty: (designId, q) => setItems(
      (cur) => q <= 0 ? cur.filter((c) => c.designId !== designId) : cur.map((c) => c.designId === designId ? { ...c, quantity: q } : c)
    ),
    clear: () => setItems([]),
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0)
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx$1.Provider, { value, children });
}
function useCart() {
  const c = reactExports.useContext(Ctx$1);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
const API_BASE = "https://tuwindi.app/api/modolk";
const TOKENS_KEY = "modolk_tokens_v1";
const TAILLES_STANDARD = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
function getTokens() {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function setTokens(tokens) {
  if (typeof window !== "undefined") localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}
function clearTokens() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKENS_KEY);
}
let _refreshPromise = null;
async function doRefresh() {
  const t = getTokens();
  if (!t) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: t.refreshToken })
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const fresh = await res.json();
    setTokens(fresh);
    return fresh;
  } catch {
    clearTokens();
    return null;
  }
}
async function apiFetch(path, init = {}) {
  const tokens = getTokens();
  const isFormData = init.body instanceof FormData;
  const headers = { ...init.headers };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (tokens) headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  let res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401 && tokens) {
    if (!_refreshPromise) {
      _refreshPromise = doRefresh().finally(() => {
        _refreshPromise = null;
      });
    }
    const fresh = await _refreshPromise;
    if (fresh) {
      headers["Authorization"] = `Bearer ${fresh.accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    }
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message.join(", ") : body.message ?? `Erreur ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return void 0;
  return res.json();
}
const api = {
  auth: {
    register: (data) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    profile: () => apiFetch("/auth/profile")
  },
  users: {
    findOne: (id) => apiFetch(`/users/${id}`),
    update: (id, data) => apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    findAll: () => apiFetch("/users")
  },
  design: {
    findAll: () => apiFetch("/design"),
    findOne: (id) => apiFetch(`/design/${id}`),
    create: (data) => apiFetch("/design", { method: "POST", body: data }),
    remove: (id) => apiFetch(`/design/${id}`, { method: "DELETE" })
  },
  categorie: {
    findAll: () => apiFetch("/categorie"),
    findOne: (id) => apiFetch(`/categorie/${id}`),
    create: (data) => apiFetch("/categorie", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/categorie/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id) => apiFetch(`/categorie/${id}`, { method: "DELETE" })
  },
  tissus: {
    findAll: () => apiFetch("/tissus"),
    create: (data) => apiFetch("/tissus", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/tissus/${id}`, { method: "PATCH", body: data }),
    remove: (id) => apiFetch(`/tissus/${id}`, { method: "DELETE" })
  },
  mesure: {
    findAll: (userId) => apiFetch(`/mesure/${userId}/all`),
    create: (userId, data) => apiFetch(`/mesure/${userId}`, { method: "POST", body: JSON.stringify(data) }),
    update: (id, userId, data) => apiFetch(`/mesure/${id}/${userId}`, { method: "PATCH", body: JSON.stringify(data) }),
    findOne: (id, userId) => apiFetch(`/mesure/${id}/${userId}`),
    remove: (id, userId) => apiFetch(`/mesure/${id}/${userId}`, { method: "DELETE" })
  },
  commande: {
    create: (data) => apiFetch("/commande", { method: "POST", body: JSON.stringify(data) }),
    findUserCommandes: (userId) => apiFetch(`/commande/user/${userId}`),
    findAll: () => apiFetch("/commande"),
    findOne: (id) => apiFetch(`/commande/${id}`),
    update: (id, data) => apiFetch(`/commande/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    updateStatut: (id, statutCommande) => apiFetch(`/commande/${id}/statut`, {
      method: "PATCH",
      body: JSON.stringify({ statutCommande })
    }),
    remove: (id) => apiFetch(`/commande/${id}`, { method: "DELETE" })
  },
  custumOption: {
    findByModel: (modelId) => apiFetch(`/custum-option/${modelId}`),
    create: (data) => apiFetch("/custum-option", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiFetch(`/custum-option/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),
    remove: (id) => apiFetch(`/custum-option/${id}`, { method: "DELETE" })
  },
  paiement: {
    create: (data) => apiFetch("/paiement", { method: "POST", body: JSON.stringify(data) }),
    findAll: () => apiFetch("/paiement"),
    findOne: (id) => apiFetch(`/paiement/${id}`),
    remove: (id) => apiFetch(`/paiement/${id}`, { method: "DELETE" })
  }
};
const formatPrice = (amount) => `${amount.toLocaleString("fr-FR")} FCFA`;
const Ctx = reactExports.createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const tokens = getTokens();
    if (!tokens) {
      setLoading(false);
      return;
    }
    api.auth.profile().then(({ user: u }) => setUser(u)).catch(() => clearTokens()).finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const { user: u, tokens } = await api.auth.login({ email, password });
    setTokens(tokens);
    setUser(u);
  };
  const register = async (data) => {
    const { user: u, tokens } = await api.auth.register(data);
    setTokens(tokens);
    setUser(u);
  };
  const signOut = () => {
    clearTokens();
    setUser(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Ctx.Provider,
    {
      value: {
        user,
        loading,
        isAdmin: user?.role === "ADMIN",
        isClient: user?.role === "CLIENT",
        login,
        register,
        signOut
      },
      children
    }
  );
}
function useAuth() {
  const c = reactExports.useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$5 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$5.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CartProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-center" })
  ] }) }) });
}
const $$splitComponentImporter$4 = () => import("./compte-DMAKrXLH.mjs");
const Route$4 = createFileRoute("/compte")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
  head: () => ({
    meta: [{
      title: "Mon compte — MODOLK"
    }]
  })
});
const $$splitComponentImporter$3 = () => import("./boutique-DceISt2H.mjs");
const Route$3 = createFileRoute("/boutique")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
  head: () => ({
    meta: [{
      title: "Boutique — MODOLK"
    }]
  })
});
const $$splitComponentImporter$2 = () => import("./auth-CWoIG65f.mjs");
const Route$2 = createFileRoute("/auth")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
  head: () => ({
    meta: [{
      title: "Connexion — MODOLK"
    }]
  })
});
const $$splitComponentImporter$1 = () => import("./admin-9TOtVL25.mjs");
const Route$1 = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
  head: () => ({
    meta: [{
      title: "Admin — MODOLK"
    }]
  })
});
const $$splitComponentImporter = () => import("./index-hFUz5-y8.mjs");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  head: () => ({
    meta: [{
      title: "MODOLK — Héritage & Élégance"
    }, {
      name: "description",
      content: "MODOLK : une marque inspirée par l'Afrique, façonnée par l'élégance contemporaine."
    }]
  })
});
const CompteRoute = Route$4.update({
  id: "/compte",
  path: "/compte",
  getParentRoute: () => Route$5
});
const BoutiqueRoute = Route$3.update({
  id: "/boutique",
  path: "/boutique",
  getParentRoute: () => Route$5
});
const AuthRoute = Route$2.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$5
});
const AdminRoute = Route$1.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$5
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  AuthRoute,
  BoutiqueRoute,
  CompteRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  TAILLES_STANDARD as T,
  api as a,
  useCart as b,
  formatPrice as f,
  router as r,
  useAuth as u
};
