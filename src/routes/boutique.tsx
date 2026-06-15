import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { api, Design, Mesure, formatPrice, TailleStandard, TAILLES_STANDARD } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import logo from "@/assets/modolk-logo.png";
import femmeImg from "@/assets/femme.jpg";
import hommeImg from "@/assets/homme.jpg";
import enfantImg from "@/assets/enfant.jpg";

export const Route = createFileRoute("/boutique")({
  component: BoutiquePage,
  head: () => ({ meta: [{ title: "Boutique — MODOLK" }] }),
});

type Category = "tous" | "femme" | "homme" | "enfant";

const categoryMap: Record<string, string> = {
  Femme: "femme",
  Homme: "homme",
  Enfant: "enfant",
};

const fallback: Record<string, string> = {
  femme: femmeImg,
  homme: hommeImg,
  enfant: enfantImg,
};

const MESURE_EMPTY = {
  label: "", tailleStandard: "" as TailleStandard | "",
  poitrine: 0, poids: 0, epaule: 0,
  longueurBras: 0, longueurJambe: 0, cou: 0,
  hanche: 0, poignet: 0, ventre: 0,
};

function BoutiquePage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [cat, setCat] = useState<Category>("tous");
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout state
  const [checkingOut, setCheckingOut] = useState(false);
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [selectedMesureId, setSelectedMesureId] = useState<number | null>(null);
  const [showMesureForm, setShowMesureForm] = useState(false);
  const [newMesure, setNewMesure] = useState(MESURE_EMPTY);
  const [savingMesure, setSavingMesure] = useState(false);
  const [mesureMode, setMesureMode] = useState<"standard" | "complete">("standard");

  useEffect(() => {
    api.design.findAll()
      .then((data) => setDesigns(data))
      .catch(() => toast.error("Impossible de charger les modèles."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    api.mesure.findAll(user.id).then((m) => {
      setMesures(m);
      if (m.length > 0) setSelectedMesureId(m[0].id);
    }).catch(() => {});
  }, [user]);

  const filtered = useMemo(() => {
    if (cat === "tous") return designs;
    return designs.filter((d) => (categoryMap[d.categorie?.nom ?? ""] ?? "").toLowerCase() === cat);
  }, [cat, designs]);

  function getImageUrl(d: Design): string {
    if (d.medias.length > 0) {
      const url = d.medias[0].imageUrl;
      if (url.startsWith("/uploads/")) {
        return `${(import.meta.env.VITE_API_URL as string ?? "http://localhost:3000/api/v1").replace("/api/v1", "")}${url}`;
      }
      return url;
    }
    const catKey = (categoryMap[d.categorie?.nom ?? ""] ?? "femme") as keyof typeof fallback;
    return fallback[catKey] ?? femmeImg;
  }

  async function saveMesure() {
    if (!user) return;
    setSavingMesure(true);
    try {
      const payload: Omit<Mesure, "id" | "utilisateurId"> = { label: newMesure.label };
      if (mesureMode === "standard") {
        if (!newMesure.tailleStandard) { toast.error("Sélectionnez une taille."); setSavingMesure(false); return; }
        payload.tailleStandard = newMesure.tailleStandard;
      } else {
        payload.poitrine = newMesure.poitrine || undefined;
        payload.poids = newMesure.poids || undefined;
        payload.epaule = newMesure.epaule || undefined;
        payload.longueurBras = newMesure.longueurBras || undefined;
        payload.longueurJambe = newMesure.longueurJambe || undefined;
        payload.cou = newMesure.cou || undefined;
        payload.hanche = newMesure.hanche || undefined;
        payload.poignet = newMesure.poignet || undefined;
        payload.ventre = newMesure.ventre || undefined;
      }
      const created = await api.mesure.create(user.id, payload);
      setMesures((prev) => [...prev, created]);
      setSelectedMesureId(created.id);
      setShowMesureForm(false);
      setNewMesure(MESURE_EMPTY);
      toast.success("Mesures enregistrées.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingMesure(false);
    }
  }

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    if (cart.items.length === 0) return;
    if (!selectedMesureId) { toast.error("Veuillez sélectionner ou créer vos mesures."); return; }

    setCheckingOut(true);
    try {
      await api.commande.create({
        utilisateurId: user.id,
        tenues: cart.items.map((i) => ({
          modelId: i.designId,
          tissusId: i.tissusId,
          mesureId: selectedMesureId,
          quantite: i.quantity,
          optionIds: [],
        })),
      });
      cart.clear();
      toast.success("Commande passée avec succès !");
      navigate({ to: "/compte" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setCheckingOut(false);
    }
  }

  const cats: Category[] = ["tous", "femme", "homme", "enfant"];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="MODOLK" className="h-9 w-9 object-contain" />
          <span className="tracking-[0.25em] text-sm">MODOLK</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/compte" className="text-muted-foreground hover:text-foreground">Mon compte</Link>
          <span className="rounded-full border border-border px-3 py-1.5 text-xs">
            Panier · {cart.count} · {formatPrice(cart.total)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-xs tracking-[0.3em] text-accent">BOUTIQUE</div>
        <h1 className="mt-3 text-4xl font-light md:text-5xl">Notre collection</h1>

        {/* Filtres catégories */}
        <div className="mt-8 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition ${
                cat === c ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grille des designs */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">Aucun modèle pour cette catégorie.</p>
          ) : (
            filtered.map((d) => (
              <article key={d.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={getImageUrl(d)}
                    alt={d.nom}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-accent">
                    {d.categorie?.nom ?? "—"} · {d.tissus?.type}
                  </div>
                  <h3 className="mt-1 text-lg font-light">{d.nom}</h3>
                  {d.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.description}</p>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    Tissu : {d.tissus?.couleur} · {d.tissus?.texture}
                  </div>
                  {d.options.length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Options : {d.options.map((o) => o.nom).join(", ")}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base font-medium">{formatPrice(d.prixBase)}</span>
                    <button
                      onClick={() => {
                        cart.add({
                          designId: d.id,
                          tissusId: d.tissusId,
                          name: d.nom,
                          price: d.prixBase,
                          image_url: d.medias[0]?.imageUrl ?? null,
                        });
                        toast.success(`${d.nom} ajouté au panier`);
                      }}
                      className="rounded-full px-4 py-1.5 text-xs font-medium text-accent-foreground"
                      style={{ background: "var(--gradient-gold)" }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Panier & checkout */}
        <section className="mt-20 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-light">Mon panier</h2>
          {cart.items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Votre panier est vide.</p>
          ) : (
            <>
              <ul className="mt-6 divide-y divide-border">
                {cart.items.map((i) => (
                  <li key={i.designId} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <div className="text-sm">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{formatPrice(i.price)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={i.quantity}
                        onChange={(e) => cart.setQty(i.designId, Number(e.target.value))}
                        className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      />
                      <span className="w-28 text-right text-sm">{formatPrice(i.price * i.quantity)}</span>
                      <button onClick={() => cart.remove(i.designId)} className="text-xs text-muted-foreground hover:text-foreground">
                        Retirer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total estimé</span>
                <span className="text-xl">{formatPrice(cart.total)}</span>
              </div>

              {/* Checkout */}
              <form onSubmit={checkout} className="mt-8 space-y-5">
                {user ? (
                  <>
                    {/* Sélection mesure */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-light">Mesures pour la commande</label>
                        <button
                          type="button"
                          onClick={() => setShowMesureForm(!showMesureForm)}
                          className="text-xs text-accent hover:underline"
                        >
                          {showMesureForm ? "Annuler" : mesures.length === 0 ? "Créer mes mesures" : "Nouvelle mesure"}
                        </button>
                      </div>

                      {mesures.length > 0 && !showMesureForm && (
                        <select
                          value={selectedMesureId ?? ""}
                          onChange={(e) => setSelectedMesureId(Number(e.target.value))}
                          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {mesures.map((m) => (
                            <option key={m.id} value={m.id}>{m.label} {m.tailleStandard ? `(${m.tailleStandard})` : "(sur mesure)"}</option>
                          ))}
                        </select>
                      )}

                      {(showMesureForm || mesures.length === 0) && (
                        <div className="mt-3 rounded-xl border border-border bg-background p-4 space-y-3">
                          <input
                            required
                            placeholder="Nom de la mesure (ex: Tenue mariage)"
                            value={newMesure.label}
                            onChange={(e) => setNewMesure({ ...newMesure, label: e.target.value })}
                            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                          />
                          {/* Toggle mode */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setMesureMode("standard")}
                              className={`flex-1 rounded-full border px-3 py-1.5 text-xs transition ${mesureMode === "standard" ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"}`}
                            >
                              Taille standard
                            </button>
                            <button
                              type="button"
                              onClick={() => setMesureMode("complete")}
                              className={`flex-1 rounded-full border px-3 py-1.5 text-xs transition ${mesureMode === "complete" ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"}`}
                            >
                              Sur mesure
                            </button>
                          </div>
                          {mesureMode === "standard" ? (
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Taille</label>
                              <select
                                value={newMesure.tailleStandard}
                                onChange={(e) => setNewMesure({ ...newMesure, tailleStandard: e.target.value as TailleStandard })}
                                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                              >
                                <option value="">Choisir une taille…</option>
                                {TAILLES_STANDARD.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-muted-foreground">Entrez vos mesures en centimètres (sauf poids en kg).</p>
                              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {(["poitrine", "epaule", "cou", "hanche", "ventre", "poignet", "longueurBras", "longueurJambe", "poids"] as const).map((k) => (
                                  <div key={k}>
                                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min={0}
                                      value={(newMesure[k] as number) || ""}
                                      onChange={(e) => setNewMesure({ ...newMesure, [k]: parseFloat(e.target.value) || 0 })}
                                      className="mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          <button
                            type="button"
                            disabled={savingMesure || !newMesure.label}
                            onClick={saveMesure}
                            className="rounded-full px-5 py-2 text-xs text-accent-foreground disabled:opacity-50"
                            style={{ background: "var(--gradient-gold)" }}
                          >
                            {savingMesure ? "..." : "Enregistrer les mesures"}
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={checkingOut || !selectedMesureId}
                      className="w-full rounded-full px-6 py-3 text-sm font-medium text-accent-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
                      style={{ background: "var(--gradient-gold)" }}
                    >
                      {checkingOut ? "..." : "Valider la commande"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/auth" })}
                    className="w-full rounded-full px-6 py-3 text-sm font-medium text-accent-foreground"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    Se connecter pour commander
                  </button>
                )}
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
