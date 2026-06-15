import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api, Commande, Mesure, formatPrice, TailleStandard, TAILLES_STANDARD } from "@/lib/api";
import { toast } from "sonner";
import logo from "@/assets/modolk-logo.png";

export const Route = createFileRoute("/compte")({
  component: ComptePage,
  head: () => ({ meta: [{ title: "Mon compte — MODOLK" }] }),
});

const STATUT_LABEL: Record<string, string> = {
  EnAttente: "En attente",
  Payer: "Payée",
  EnProduction: "En production",
  Pret: "Prête",
  Livre: "Livrée",
};

const MESURE_EMPTY = {
  label: "", tailleStandard: "" as TailleStandard | "",
  poitrine: 0, poids: 0, epaule: 0,
  longueurBras: 0, longueurJambe: 0, cou: 0,
  hanche: 0, poignet: 0, ventre: 0,
};

function ComptePage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ nom: "", prenom: "", telephone: "", adresse: "" });
  const [saving, setSaving] = useState(false);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [newMesure, setNewMesure] = useState(MESURE_EMPTY);
  const [savingMesure, setSavingMesure] = useState(false);
  const [showMesureForm, setShowMesureForm] = useState(false);
  const [mesureMode, setMesureMode] = useState<"standard" | "complete">("standard");
  const [tab, setTab] = useState<"profil" | "commandes" | "mesures">("profil");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      nom: user.nom ?? "",
      prenom: user.prenom ?? "",
      telephone: user.telephone ?? "",
      adresse: user.adresse ?? "",
    });
    api.commande.findUserCommandes(user.id)
      .then((c) => setCommandes(c))
      .catch(() => {});
    api.mesure.findAll(user.id)
      .then((m) => setMesures(m))
      .catch(() => {});
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await api.users.update(user.id, {
        nom: profile.nom,
        prenom: profile.prenom,
        telephone: profile.telephone,
        adresse: profile.adresse || undefined,
      });
      toast.success("Profil mis à jour.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function createMesure() {
    if (!user || !newMesure.label) return;
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
      setNewMesure(MESURE_EMPTY);
      setShowMesureForm(false);
      toast.success("Mesures ajoutées.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingMesure(false);
    }
  }

  async function deleteMesure(mesureId: number) {
    if (!user) return;
    if (!confirm("Supprimer cette mesure ?")) return;
    try {
      await api.mesure.remove(mesureId, user.id);
      setMesures((prev) => prev.filter((m) => m.id !== mesureId));
      toast.success("Mesure supprimée.");
    } catch (err) {
      toast.error((err as Error).message);
    }
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
          <button
            onClick={() => { signOut(); navigate({ to: "/" }); }}
            className="text-muted-foreground hover:text-foreground"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-xs tracking-[0.3em] text-accent">MON COMPTE</div>
        <h1 className="mt-3 text-4xl font-light">
          Bienvenue{user.prenom ? `, ${user.prenom}` : ""}.
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">{user.email}</p>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-border">
          {(["profil", "commandes", "mesures"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize transition ${
                tab === t ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "mesures" ? "Mes mesures" : t === "commandes" ? "Mes commandes" : "Profil"}
            </button>
          ))}
        </div>

        {/* Tab: Profil */}
        {tab === "profil" && (
          <form onSubmit={saveProfile} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-8">
            <h2 className="text-lg font-light">Mes informations</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-wide text-muted-foreground">Nom</label>
                <input
                  value={profile.nom}
                  onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>
              <div>
                <label className="text-xs tracking-wide text-muted-foreground">Prénom</label>
                <input
                  value={profile.prenom}
                  onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-xs tracking-wide text-muted-foreground">Téléphone</label>
              <input
                value={profile.telephone}
                onChange={(e) => setProfile({ ...profile, telephone: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs tracking-wide text-muted-foreground">Adresse de livraison</label>
              <textarea
                rows={3}
                value={profile.adresse}
                onChange={(e) => setProfile({ ...profile, adresse: e.target.value })}
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
        )}

        {/* Tab: Commandes */}
        {tab === "commandes" && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-8">
            <h2 className="text-lg font-light">Mes commandes</h2>
            {commandes.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
            ) : (
              <ul className="mt-6 divide-y divide-border">
                {commandes.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div>
                      <div>Commande #{o.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(o.dateCommande).toLocaleDateString("fr-FR")} · {o.tenues.length} tenue(s)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(o.totalPrice)}</div>
                      <div className="text-xs uppercase tracking-wider text-accent">
                        {STATUT_LABEL[o.statutCommande] ?? o.statutCommande}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Tab: Mesures */}
        {tab === "mesures" && (
          <section className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light">Mes mesures</h2>
              <button
                onClick={() => setShowMesureForm(!showMesureForm)}
                className="text-xs text-accent hover:underline"
              >
                {showMesureForm ? "Annuler" : "Ajouter une mesure"}
              </button>
            </div>

            {showMesureForm && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-sm font-medium">Nouvelle mesure</h3>
                <input
                  required
                  placeholder="Nom (ex: Tenue mariage)"
                  value={newMesure.label}
                  onChange={(e) => setNewMesure({ ...newMesure, label: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                    <label className="text-xs tracking-wide text-muted-foreground">Taille</label>
                    <select
                      value={newMesure.tailleStandard}
                      onChange={(e) => setNewMesure({ ...newMesure, tailleStandard: e.target.value as TailleStandard })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Choisir une taille…</option>
                      {TAILLES_STANDARD.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Toutes les valeurs en centimètres, sauf le poids (kg).</p>
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
                            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button
                  disabled={savingMesure || !newMesure.label}
                  onClick={createMesure}
                  className="rounded-full px-5 py-2 text-xs text-accent-foreground disabled:opacity-50"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  {savingMesure ? "..." : "Enregistrer"}
                </button>
              </div>
            )}

            {mesures.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune mesure enregistrée. Ajoutez vos mesures pour pouvoir commander sur mesure.
              </p>
            ) : (
              <ul className="space-y-3">
                {mesures.map((m) => (
                  <li key={m.id} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{m.label}</h3>
                      <button
                        onClick={() => deleteMesure(m.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                    {m.tailleStandard ? (
                      <div className="mt-3 text-sm">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Taille standard : </span>
                        <span className="font-medium text-foreground">{m.tailleStandard}</span>
                      </div>
                    ) : (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground md:grid-cols-5">
                        {(["poitrine", "epaule", "cou", "hanche", "ventre", "poignet", "longueurBras", "longueurJambe", "poids"] as const).map((k) => (
                          m[k] != null && (
                            <div key={k}>
                              <span className="uppercase tracking-wider">{k}</span>
                              <div className="mt-0.5 text-foreground">{m[k]} {k === "poids" ? "kg" : "cm"}</div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
