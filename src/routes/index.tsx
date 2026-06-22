import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/modolk-logo.png";
import hommeImg from "@/assets/homme.jpg";
import femmeImg from "@/assets/femme.jpg";
import enfantImg from "@/assets/enfant.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MODOLK — Héritage & Élégance" },
      {
        name: "description",
        content:
          "MODOLK : une marque inspirée par l'Afrique, façonnée par l'élégance contemporaine.",
      },
    ],
  }),
});

// Subtle Adinkra-inspired geometric pattern (kept light, used as decor)
function PatternBand({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 600 40"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="motif" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M20 4 L36 20 L20 36 L4 20 Z M20 12 L28 20 L20 28 L12 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <rect width="600" height="40" fill="url(#motif)" />
    </svg>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MODOLK" className="h-10 w-10 object-contain" />
          <span className="text-lg font-semibold tracking-[0.25em]">MODOLK</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm tracking-wide text-muted-foreground md:flex">
          <Link to="/boutique" className="hover:text-foreground transition-colors">
            Boutique
          </Link>
          <Link to="/boutique" className="hover:text-foreground transition-colors">
            Femme
          </Link>
          <Link to="/boutique" className="hover:text-foreground transition-colors">
            Homme
          </Link>
          <Link to="/boutique" className="hover:text-foreground transition-colors">
            Enfant
          </Link>
          <a href="#histoire" className="hover:text-foreground transition-colors">
            Histoire
          </a>
          <Link
            to="/compte"
            className="rounded-full border border-border px-4 py-2 text-foreground hover:bg-secondary transition-colors"
          >
            Mon compte
          </Link>
        </nav>
      </header>

      <PatternBand className="h-6 w-full text-primary/40" />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-28">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 30%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 70%)",
          }}
        />
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="MODOLK"
            className="h-40 w-40 object-contain drop-shadow-[0_10px_40px_color-mix(in_oklab,var(--gold)_45%,transparent)]"
          />
          <h1 className="mt-10 max-w-3xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            L'héritage <span className="italic text-accent">tissé</span> dans
            <br /> chaque détail.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            MODOLK célèbre la richesse des racines africaines avec la précision d'un savoir-faire
            contemporain.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/boutique"
              className="rounded-full px-7 py-3 text-sm font-medium tracking-wide text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-gold)" }}
            >
              Découvrir la boutique
            </Link>
            <a
              href="#histoire"
              className="rounded-full border border-border px-7 py-3 text-sm font-medium tracking-wide hover:bg-secondary transition-colors"
            >
              Notre histoire
            </a>
          </div>
        </div>
      </section>

      <PatternBand className="h-6 w-full text-primary/30" />

      {/* Collections */}
      <section id="collection" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="text-xs tracking-[0.3em] text-accent">COLLECTIONS</div>
          <h2 className="mt-3 text-4xl font-light md:text-5xl">
            Pour <span className="italic">elle</span>, pour <span className="italic">lui</span>,
            pour <span className="italic">eux</span>.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Femme", d: "Silhouettes fluides, étoffes nobles.", img: femmeImg, n: "01" },
            { t: "Homme", d: "Coupes nettes, allure assurée.", img: hommeImg, n: "02" },
            { t: "Enfant", d: "Héritage transmis, douceur retrouvée.", img: enfantImg, n: "03" },
          ].map((c) => (
            <Link
              key={c.t}
              to="/boutique"
              className="group relative block overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={c.img}
                  alt={`Collection ${c.t}`}
                  width={800}
                  height={1024}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent p-6 text-background"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in oklab, var(--ink) 85%, transparent), transparent)",
                }}
              >
                <div className="text-[10px] tracking-[0.3em] text-primary">{c.n}</div>
                <h3 className="mt-1 text-2xl font-light text-background">{c.t}</h3>
                <p className="mt-1 text-sm text-background/80">{c.d}</p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs tracking-[0.25em] text-primary">
                  DÉCOUVRIR
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pillars */}
        <div className="mt-24 grid gap-10 md:grid-cols-3">
          {[
            { t: "Origine", d: "Inspirée par la terre, le soleil et les motifs du continent." },
            { t: "Artisanat", d: "Une exécution méticuleuse, geste après geste." },
            { t: "Modernité", d: "Une silhouette contemporaine, une présence intemporelle." },
          ].map((p, i) => (
            <article
              key={p.t}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-[var(--shadow-gold)]"
            >
              <div className="text-xs tracking-[0.3em] text-accent">0{i + 1}</div>
              <h3 className="mt-4 text-2xl font-light">{p.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Story */}
      <section
        id="histoire"
        className="relative overflow-hidden border-y border-border bg-secondary/40"
      >
        <PatternBand className="absolute inset-x-0 top-0 h-6 text-accent/30" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-28 md:grid-cols-2">
          <div>
            <div className="text-xs tracking-[0.3em] text-accent">L'ESSENCE</div>
            <h2 className="mt-4 text-4xl font-light leading-tight md:text-5xl">
              Une mémoire <span className="italic">vivante</span>, portée avec fierté.
            </h2>
            <p className="mt-6 max-w-md text-muted-foreground">
              Chaque pièce porte une histoire — celle d'une culture, d'un geste, d'une transmission.
              MODOLK assemble ces fragments dans un langage visuel sobre et précieux.
            </p>
          </div>
          <div className="relative flex aspect-square items-center justify-center rounded-3xl border border-primary/30 bg-background">
            <img src={logo} alt="" className="h-2/3 w-2/3 object-contain opacity-90" />
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 65%)",
              }}
            />
          </div>
        </div>
        <PatternBand className="absolute inset-x-0 bottom-0 h-6 text-accent/30" />
      </section>

      {/* Footer */}
      <footer id="contact" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={logo} alt="MODOLK" className="h-10 w-10 object-contain" />
          <div className="text-sm tracking-[0.3em]">MODOLK</div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MODOLK — Fait avec soin, inspiré d'Afrique.
          </p>
        </div>
      </footer>
    </div>
  );
}
