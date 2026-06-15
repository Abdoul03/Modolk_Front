const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:3000/api/v1";
const TOKENS_KEY = "modolk_tokens_v1";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BackendUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: "ADMIN" | "CLIENT";
  adresse?: string | null;
  taille?: number | null;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: BackendUser;
  tokens: Tokens;
}

export interface Categorie {
  id: number;
  nom: string;
  description?: string | null;
}

export interface Media {
  id: number;
  nom: string;
  path: string;
  imageUrl: string;
}

export interface OptionCustomisation {
  id: number;
  type: string;
  nom: string;
  prixAjout: number;
}

export interface Tissus {
  id: number;
  type: string;
  couleur: string;
  texture: string;
  prixParMetre: number;
  stock: number;
}

export interface Design {
  id: number;
  nom: string;
  description?: string | null;
  prixBase: number;
  nombreDeMetre: number;
  categorieId: number;
  tissusId: number;
  categorie: Categorie;
  tissus: Tissus;
  options: OptionCustomisation[];
  medias: Media[];
}

export type TailleStandard = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
export const TAILLES_STANDARD: TailleStandard[] = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export interface Mesure {
  id: number;
  label: string;
  tailleStandard?: TailleStandard | null;
  poitrine?: number | null;
  poids?: number | null;
  epaule?: number | null;
  longueurBras?: number | null;
  longueurJambe?: number | null;
  cou?: number | null;
  hanche?: number | null;
  poignet?: number | null;
  ventre?: number | null;
  utilisateurId: number;
}

export interface Tenue {
  id: number;
  quantite: number;
  prixUnitaire: number;
  modelId: number;
  tissusId: number;
  mesureId: number;
  commandeId: number;
}

export interface Commande {
  id: number;
  dateCommande: string;
  statutCommande: "EnAttente" | "Payer" | "EnProduction" | "Pret" | "Livre";
  totalPrice: number;
  utilisateurId: number;
  tenues: Tenue[];
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getTokens(): Tokens | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: Tokens): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKENS_KEY);
}

// ─── Refresh singleton ────────────────────────────────────────────────────────

let _refreshPromise: Promise<Tokens | null> | null = null;

async function doRefresh(): Promise<Tokens | null> {
  const t = getTokens();
  if (!t) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: t.refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const fresh = (await res.json()) as Tokens;
    setTokens(fresh);
    return fresh;
  } catch {
    clearTokens();
    return null;
  }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const tokens = getTokens();
  const isFormData = init.body instanceof FormData;
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
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
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? `Erreur ${res.status}`);
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (data: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      motDePasse: string;
      adresse?: string;
    }) => apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

    profile: () => apiFetch<{ message: string; user: BackendUser }>("/auth/profile"),
  },

  users: {
    findOne: (id: number) => apiFetch<BackendUser>(`/users/${id}`),
    update: (id: number, data: Partial<BackendUser & { motDePasse?: string }>) =>
      apiFetch<BackendUser>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    findAll: () => apiFetch<BackendUser[]>("/users"),
  },

  design: {
    findAll: () => apiFetch<Design[]>("/design"),
    findOne: (id: number) => apiFetch<Design>(`/design/${id}`),
    create: (data: FormData) =>
      apiFetch<{ model: Design; medias: Media[] }>("/design", { method: "POST", body: data }),
    remove: (id: number) => apiFetch<{ message: string }>(`/design/${id}`, { method: "DELETE" }),
  },

  categorie: {
    findAll: () => apiFetch<Categorie[]>("/categorie"),
    findOne: (id: number) => apiFetch<Categorie>(`/categorie/${id}`),
    create: (data: { nom: string; description?: string }) =>
      apiFetch<Categorie>("/categorie", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{ nom: string; description?: string }>) =>
      apiFetch<Categorie>(`/categorie/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch<void>(`/categorie/${id}`, { method: "DELETE" }),
  },

  tissus: {
    findAll: () => apiFetch<Tissus[]>("/tissus"),
    create: (data: FormData) => apiFetch<Tissus>("/tissus", { method: "POST", body: data }),
    update: (id: number, data: FormData) =>
      apiFetch<Tissus>(`/tissus/${id}`, { method: "PATCH", body: data }),
    remove: (id: number) => apiFetch<void>(`/tissus/${id}`, { method: "DELETE" }),
  },

  mesure: {
    findAll: (userId: number) => apiFetch<Mesure[]>(`/mesure/${userId}/all`),
    create: (userId: number, data: Omit<Mesure, "id" | "utilisateurId">) =>
      apiFetch<Mesure>(`/mesure/${userId}`, { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, userId: number, data: Partial<Omit<Mesure, "id" | "utilisateurId">>) =>
      apiFetch<Mesure>(`/mesure/${id}/${userId}`, { method: "PATCH", body: JSON.stringify(data) }),
    findOne: (id: number, userId: number) => apiFetch<Mesure>(`/mesure/${id}/${userId}`),
    remove: (id: number, userId: number) =>
      apiFetch<Mesure>(`/mesure/${id}/${userId}`, { method: "DELETE" }),
  },

  commande: {
    create: (data: {
      utilisateurId: number;
      tenues: {
        modelId: number;
        tissusId: number;
        mesureId: number;
        quantite: number;
        optionIds?: number[];
      }[];
    }) => apiFetch<Commande>("/commande", { method: "POST", body: JSON.stringify(data) }),

    findUserCommandes: (userId: number) => apiFetch<Commande[]>(`/commande/user/${userId}`),
    findAll: () => apiFetch<Commande[]>("/commande"),
    findOne: (id: number) => apiFetch<Commande>(`/commande/${id}`),
    update: (id: number, data: object) =>
      apiFetch<Commande>(`/commande/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    updateStatut: (id: number, statutCommande: string) =>
      apiFetch<Commande>(`/commande/${id}/statut`, {
        method: "PATCH",
        body: JSON.stringify({ statutCommande }),
      }),

    remove: (id: number) => apiFetch<void>(`/commande/${id}`, { method: "DELETE" }),
  },

  custumOption: {
    findByModel: (modelId: number) => apiFetch<OptionCustomisation[]>(`/custum-option/${modelId}`),
    create: (data: { type: string; nom: string; prixAjout: number; modelId: number }) =>
      apiFetch<OptionCustomisation>("/custum-option", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<{ type: string; nom: string; prixAjout: number }>) =>
      apiFetch<OptionCustomisation>(`/custum-option/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    remove: (id: number) => apiFetch<void>(`/custum-option/${id}`, { method: "DELETE" }),
  },

  paiement: {
    create: (data: { commandeId: number; modePaiement: string; montant: number }) =>
      apiFetch<{
        id: number;
        modePaiement: string;
        montant: number;
        statutPaiement: string;
        commandeId: number;
      }>("/paiement", { method: "POST", body: JSON.stringify(data) }),
    findAll: () =>
      apiFetch<
        {
          id: number;
          modePaiement: string;
          montant: number;
          statutPaiement: string;
          commandeId: number;
        }[]
      >("/paiement"),
    findOne: (id: number) =>
      apiFetch<{
        id: number;
        modePaiement: string;
        montant: number;
        statutPaiement: string;
        commandeId: number;
      }>(`/paiement/${id}`),
    remove: (id: number) => apiFetch<void>(`/paiement/${id}`, { method: "DELETE" }),
  },
};

// ─── Utilitaire prix ──────────────────────────────────────────────────────────

export const formatPrice = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
