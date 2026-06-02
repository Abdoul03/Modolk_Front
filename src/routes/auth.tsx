import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [{ title: "Connexion — MODOLK" }],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/compte" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const country = COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY;
        const cleaned = phoneLocal.replace(/\D/g, "");
        const fullPhone = cleaned ? `${country.dial} ${cleaned}` : "";

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/compte`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        // Auto-confirm activé : la session est immédiate. Sinon on tente une connexion.
        if (!data.session) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (signInErr) throw signInErr;
        }

        // Sauvegarde téléphone + pays dans le profil
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if (uid && fullPhone) {
          await supabase.from("profiles").update({ phone: fullPhone }).eq("id", uid);
        }

        toast.success("Compte créé. Bienvenue !");
        navigate({ to: "/compte" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        toast.success("Bienvenue.");
        navigate({ to: "/compte" });
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.toLowerCase().includes("invalid login")) {
        toast.error("E-mail ou mot de passe incorrect.");
      } else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("user already")) {
        toast.error("Un compte existe déjà avec cet e-mail. Connecte-toi.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center text-xs tracking-[0.3em] text-muted-foreground hover:text-foreground">
          ← MODOLK
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-gold)]">
          <h1 className="text-2xl font-light">
            {mode === "signin" ? "Se connecter" : "Créer un compte"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Accède à ton espace MODOLK." : "Rejoins l'univers MODOLK."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-xs tracking-wide text-muted-foreground">Nom complet</label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wide text-muted-foreground">Téléphone</label>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-2 text-sm outline-none focus:border-ring"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Numéro"
                      value={phoneLocal}
                      onChange={(e) => setPhoneLocal(e.target.value)}
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-xs tracking-wide text-muted-foreground">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs tracking-wide text-muted-foreground">Mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full px-6 py-3 text-sm font-medium tracking-wide text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:opacity-60"
              style={{ background: "var(--gradient-gold)" }}
            >
              {busy ? "..." : mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => setMode("signup")} className="text-accent hover:underline">
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?{" "}
                <button onClick={() => setMode("signin")} className="text-accent hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
