import { Link } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  Github,
  Mail,
  Navigation,
  Wrench,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import type { TranslationKey } from '../i18n/translations';

// Pilot inquiries land here — replace when a dedicated company address exists.
const PILOT_CONTACT = 'amisha223singh@gmail.com';

const BASE = import.meta.env.BASE_URL;
// The fleet and suite apps deploy beside this one on the same Pages site.
const FLEET_BASE = `${BASE}fleet/`;
const SUITE_BASE = `${BASE}suite/`;

type Product = {
  id: string;
  tone: 'accent' | 'fork' | 'tool-dispatch' | 'tool-comply' | 'tool-hvac' | 'tool-depot';
  name: TranslationKey;
  audience: TranslationKey;
  desc: TranslationKey;
  features: [TranslationKey, TranslationKey, TranslationKey];
  demo: TranslationKey;
  href: string;
  external?: boolean;
};

// The six products — order follows the journey: purchasing → freight → office tools.
const PRODUCTS: Product[] = [
  {
    id: 'einkauf',
    tone: 'accent',
    name: 'landing.einkauf.name',
    audience: 'landing.einkauf.audience',
    desc: 'landing.einkauf.desc',
    features: ['landing.einkauf.f1', 'landing.einkauf.f2', 'landing.einkauf.f3'],
    demo: 'landing.einkauf.demo',
    href: '/dashboard',
  },
  {
    id: 'frachtradar',
    tone: 'fork',
    name: 'landing.fracht.name',
    audience: 'landing.fracht.audience',
    desc: 'landing.fracht.desc',
    features: ['landing.fracht.f1', 'landing.fracht.f2', 'landing.fracht.f3'],
    demo: 'landing.fracht.demo',
    href: FLEET_BASE,
    external: true,
  },
  {
    id: 'frachtamt',
    tone: 'tool-dispatch',
    name: 'landing.tool.dispatch.name',
    audience: 'landing.tool.dispatch.for',
    desc: 'landing.tool.dispatch.desc',
    features: ['landing.tool.dispatch.f1', 'landing.tool.dispatch.f2', 'landing.tool.dispatch.f3'],
    demo: 'landing.tool.demo',
    href: `${SUITE_BASE}#/dispatch`,
    external: true,
  },
  {
    id: 'pruefamt',
    tone: 'tool-comply',
    name: 'landing.tool.comply.name',
    audience: 'landing.tool.comply.for',
    desc: 'landing.tool.comply.desc',
    features: ['landing.tool.comply.f1', 'landing.tool.comply.f2', 'landing.tool.comply.f3'],
    demo: 'landing.tool.demo',
    href: `${SUITE_BASE}#/comply`,
    external: true,
  },
  {
    id: 'einsatzamt',
    tone: 'tool-hvac',
    name: 'landing.tool.hvac.name',
    audience: 'landing.tool.hvac.for',
    desc: 'landing.tool.hvac.desc',
    features: ['landing.tool.hvac.f1', 'landing.tool.hvac.f2', 'landing.tool.hvac.f3'],
    demo: 'landing.tool.demo',
    href: `${SUITE_BASE}#/hvac`,
    external: true,
  },
  {
    id: 'postamt',
    tone: 'tool-depot',
    name: 'landing.tool.depot.name',
    audience: 'landing.tool.depot.for',
    desc: 'landing.tool.depot.desc',
    features: ['landing.tool.depot.f1', 'landing.tool.depot.f2', 'landing.tool.depot.f3'],
    demo: 'landing.tool.demo',
    href: `${SUITE_BASE}#/depot`,
    external: true,
  },
];

const TOOL_ICONS: Record<string, typeof Navigation> = {
  frachtamt: Navigation,
  pruefamt: CalendarClock,
  einsatzamt: Wrench,
  postamt: Boxes,
};

// Static tone classes — Tailwind needs literals at build time.
const TONES: Record<Product['tone'], { text: string; bg: string; bgSoft: string }> = {
  accent: { text: 'text-accent', bg: 'bg-accent', bgSoft: 'bg-accent/10' },
  fork: { text: 'text-fork', bg: 'bg-fork', bgSoft: 'bg-fork/10' },
  'tool-dispatch': { text: 'text-tool-dispatch', bg: 'bg-tool-dispatch', bgSoft: 'bg-tool-dispatch/10' },
  'tool-comply': { text: 'text-tool-comply', bg: 'bg-tool-comply', bgSoft: 'bg-tool-comply/10' },
  'tool-hvac': { text: 'text-tool-hvac', bg: 'bg-tool-hvac', bgSoft: 'bg-tool-hvac/10' },
  'tool-depot': { text: 'text-tool-depot', bg: 'bg-tool-depot', bgSoft: 'bg-tool-depot/10' },
};

// Product mark — flagships use their real marks, tools share the Amt tile language.
function ProductMark({ product, className = 'h-12 w-12' }: { product: Product; className?: string }) {
  if (product.id === 'einkauf') {
    return (
      <span className={`clay-pill inline-flex items-center justify-center ${className}`} aria-hidden>
        <BrandMark className="h-[62%] w-[62%]" />
      </span>
    );
  }
  if (product.id === 'frachtradar') {
    return (
      <span className={`clay-pill inline-flex items-center justify-center ${className}`} aria-hidden>
        <svg viewBox="0 0 64 64" className="h-[68%] w-[68%]">
          <rect width="64" height="64" rx="14" fill="var(--color-fork)" />
          <g fill="none" stroke="var(--color-fork-ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 24h26v20H10z" />
            <path d="M36 30h7l7 7v7H36z" />
            <circle cx="18" cy="47" r="4" />
            <circle cx="43" cy="47" r="4" />
            <path d="M42 10a14 14 0 0 1 14 14" opacity="0.45" />
            <path d="M42 17a7 7 0 0 1 7 7" opacity="0.7" />
          </g>
          <circle cx="42" cy="24" r="2.5" fill="var(--color-fork-ink)" />
        </svg>
      </span>
    );
  }
  const Icon = TOOL_ICONS[product.id];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl ${TONES[product.tone].bg} text-white shadow-[3px_3px_8px_var(--shadow-dark),-3px_-3px_8px_var(--shadow-light)] ${className}`}
      aria-hidden
    >
      <Icon className="h-[52%] w-[52%]" strokeWidth={2.2} />
    </span>
  );
}

// Demo video — lazy, poster-first; plays only when the user asks.
function ProductVideo({ product }: { product: Product }) {
  const { t } = useI18n();
  return (
    <figure className="clay-card overflow-hidden p-2.5">
      <video
        controls
        preload="none"
        playsInline
        poster={`${BASE}videos/${product.id}-poster.jpg`}
        aria-label={`${t(product.name)} — ${t(product.demo)}`}
        className={`aspect-video w-full rounded-xl object-cover ${TONES[product.tone].bgSoft}`}
      >
        <source src={`${BASE}videos/${product.id}.mp4`} type="video/mp4" />
      </video>
      <figcaption className="flex items-center justify-between px-3 pb-1.5 pt-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
          {t(product.name)} · {t('landing.prod.videoSuffix')}
        </span>
        <span className={`h-2 w-2 rounded-full ${TONES[product.tone].bg}`} aria-hidden />
      </figcaption>
    </figure>
  );
}

// One full-width product section: text column + video column, alternating sides.
function ProductSection({ product, flip }: { product: Product; flip: boolean }) {
  const { t } = useI18n();
  const accentText = TONES[product.tone].text;
  const accentBg = TONES[product.tone].bg;
  const text = (
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-4">
        <ProductMark product={product} />
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
            {t(product.name)}
            {product.id === 'frachtradar' && (
              <span className="ml-2 text-sm font-medium text-subtle">{t('landing.fracht.by')}</span>
            )}
          </h3>
          <p className={`mt-0.5 text-sm font-medium ${accentText}`}>{t(product.audience)}</p>
        </div>
      </div>
      <p className="mt-5 leading-relaxed text-ink-soft">{t(product.desc)}</p>
      <ul className="mt-5 space-y-2.5">
        {product.features.map((key) => (
          <li key={key} className="flex items-start gap-2.5 text-sm text-ink">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accentBg}`} />
            {t(key)}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        {product.external ? (
          <a
            href={product.href}
            className={`inline-flex items-center gap-2 rounded-full ${accentBg} px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px`}
          >
            {t(product.demo)}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <Link
            to={product.href}
            className={`inline-flex items-center gap-2 rounded-full ${accentBg} px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-px`}
          >
            {t(product.demo)}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
        {product.id === 'einkauf' && (
          <Link to="/s/demo" className="text-sm font-medium text-accent hover:underline">
            {t('landing.einkauf.demoAlt')}
          </Link>
        )}
        {product.id === 'frachtradar' && (
          <>
            <a href={`${FLEET_BASE}#/t/demo`} className="text-sm font-medium text-fork hover:underline">
              {t('landing.fracht.demoDriver')}
            </a>
            <a href={`${FLEET_BASE}#/l/demo`} className="text-sm font-medium text-fork hover:underline">
              {t('landing.fracht.demoTrack')}
            </a>
          </>
        )}
      </div>
    </div>
  );
  return (
    <section id={`prod-${product.id}`} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-10 md:py-14">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={flip ? 'lg:order-2' : ''}>{text}</div>
        <div className={flip ? 'lg:order-1' : ''}>
          <ProductVideo product={product} />
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { t } = useI18n();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-paper text-ink" id="top">
        {/* Floating pill nav — wordmark, section links, equal demo actions */}
        <header>
          <nav
            aria-label="Primary"
            className="clay-pill fixed left-1/2 top-4 z-50 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 py-2 pl-3 pr-2 sm:gap-2 sm:pl-4"
          >
            <a href="#top" className="mr-1 flex items-center gap-2">
              <BrandMark className="h-6 w-6" />
              <span className="hidden font-display text-sm font-semibold text-ink min-[430px]:inline">Lieferuhr</span>
            </a>
            <a
              href="#produkte"
              className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline"
            >
              {t('landing.nav.products')}
            </a>
            <a
              href="#system"
              className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline"
            >
              {t('landing.nav.system')}
            </a>
            <a
              href="#integration"
              className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline"
            >
              {t('landing.nav.integration')}
            </a>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-transform duration-150 hover:-translate-y-px"
            >
              <span className="h-2 w-2 rounded-full bg-accent-ink/60" aria-hidden />
              <span className="sm:hidden">Einkauf</span>
              <span className="hidden sm:inline">{t('landing.nav.demoEinkauf')}</span>
            </Link>
            <a
              href={FLEET_BASE}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-fork px-3 py-1.5 text-sm font-medium text-fork-ink transition-transform duration-150 hover:-translate-y-px"
            >
              <span className="h-2 w-2 rounded-full bg-fork-ink/60" aria-hidden />
              <span className="sm:hidden">FrachtRadar</span>
              <span className="hidden sm:inline">{t('landing.nav.demoFracht')}</span>
            </a>
            <LanguageToggle />
          </nav>
        </header>

        <main>
          {/* Hero — typographic, then the product family strip */}
          <section className="mx-auto max-w-4xl px-5 pb-14 pt-32 text-center md:pt-36">
            <p className="reveal font-mono text-[11px] uppercase tracking-[0.16em] text-subtle" style={{ ['--i' as string]: 0 }}>
              {t('landing.hero.kicker')}
            </p>
            <h1
              className="reveal mt-4 font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink text-balance sm:text-5xl lg:text-[3.4rem]"
              style={{ ['--i' as string]: 1 }}
            >
              {t('landing.hero.title')}
            </h1>
            <p className="reveal mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft" style={{ ['--i' as string]: 2 }}>
              {t('landing.hero.sub')}
            </p>
            <div className="reveal mt-7 flex flex-wrap items-center justify-center gap-3" style={{ ['--i' as string]: 3 }}>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform duration-150 hover:-translate-y-px"
              >
                {t('landing.einkauf.demo')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={FLEET_BASE}
                className="flex items-center gap-2 rounded-full bg-fork px-5 py-2.5 text-sm font-semibold text-fork-ink transition-transform duration-150 hover:-translate-y-px"
              >
                {t('landing.fracht.demo')}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="reveal mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle" style={{ ['--i' as string]: 4 }}>
              {t('landing.hero.note')}
            </p>
          </section>

          {/* The family — all six products, one account */}
          <section id="produkte" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-8">
            <p className="mb-5 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
              {t('landing.hero.family')}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {PRODUCTS.map((product) => (
                <a
                  key={product.id}
                  href={`#prod-${product.id}`}
                  className="clay-card group flex flex-col items-center gap-2.5 px-3 py-5 text-center transition-transform duration-200 hover:-translate-y-1"
                >
                  <ProductMark product={product} className="h-10 w-10" />
                  <span className="font-display text-sm font-semibold leading-tight text-ink">{t(product.name)}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${TONES[product.tone].text}`}>
                    {t(product.audience)}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Six product sections — one per product, each with its demo video */}
          <div className="py-4">
            {PRODUCTS.map((product, i) => (
              <div key={product.id} className={i > 0 ? 'border-t border-rule/60' : ''}>
                <ProductSection product={product} flip={i % 2 === 1} />
              </div>
            ))}
          </div>

          {/* System — independent or together */}
          <section id="system" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {t('landing.system.title')}
              </h2>
              <p className="mt-3 text-ink-soft">{t('landing.system.sub')}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {(
                [
                  ['landing.system.solo.title', 'landing.system.solo.desc'],
                  ['landing.system.team.title', 'landing.system.team.desc'],
                  ['landing.system.open.title', 'landing.system.open.desc'],
                ] as const
              ).map(([title, desc]) => (
                <div key={title} className="clay-card p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">{t(title)}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{t(desc)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Integration — concrete, honest about what exists today */}
          <section id="integration" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20">
            <div className="clay-inset px-6 py-10 md:px-10">
              <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{t('landing.integrations.title')}</h2>
                  <p className="mt-3 leading-relaxed text-ink-soft">{t('landing.integrations.desc')}</p>
                  <p className="mt-3 text-sm leading-relaxed text-subtle">{t('landing.integrations.note')}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {['REST API', 'Webhooks', 'MCP', 'CSV Import/Export', 'n8n · Make · Zapier', t('landing.integrations.erp')].map(
                    (chip) => (
                      <span key={chip} className="clay-pill px-3.5 py-1.5 text-xs font-medium text-ink-soft">
                        {chip}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Pilot CTA */}
          <section id="kontakt" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
            <div className="clay-inset px-6 py-14 text-center md:py-16">
              <h2 className="mx-auto max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {t('landing.pilot.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-soft">{t('landing.pilot.desc')}</p>
              <a
                href={`mailto:${PILOT_CONTACT}?subject=Lieferuhr%20Pilot`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition-transform duration-150 hover:-translate-y-px"
              >
                {t('landing.pilot.cta')}
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{t('landing.pilot.note')}</p>
            </div>
          </section>
        </main>

        {/* Footer — products, resources, contact */}
        <footer className="border-t border-rule bg-paper-2/60">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div>
                <span className="flex items-center gap-2">
                  <BrandMark className="h-6 w-6" />
                  <span className="font-display text-base font-semibold text-ink">Lieferuhr</span>
                </span>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{t('landing.footer.line')}</p>
              </div>
              <nav aria-label={t('landing.footer.prodTitle')}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{t('landing.footer.prodTitle')}</p>
                <ul className="mt-3.5 space-y-2 text-sm">
                  {PRODUCTS.map((product) => (
                    <li key={product.id}>
                      <a href={`#prod-${product.id}`} className="text-ink-soft transition-colors hover:text-ink">
                        {t(product.name)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label={t('landing.footer.resTitle')}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{t('landing.footer.resTitle')}</p>
                <ul className="mt-3.5 space-y-2 text-sm">
                  <li>
                    <a
                      href="https://github.com/0-uddeshya-0/LieferUhr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink"
                    >
                      <Github className="h-3.5 w-3.5" aria-hidden />
                      {t('landing.footer.repo')}
                    </a>
                  </li>
                  <li>
                    <a href={SUITE_BASE} className="text-ink-soft transition-colors hover:text-ink">
                      Betriebsamt
                    </a>
                  </li>
                  <li>
                    <a href="#integration" className="text-ink-soft transition-colors hover:text-ink">
                      {t('landing.nav.integration')}
                    </a>
                  </li>
                </ul>
              </nav>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{t('landing.footer.contactTitle')}</p>
                <a
                  href={`mailto:${PILOT_CONTACT}`}
                  className="mt-3.5 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  {PILOT_CONTACT}
                </a>
                <div className="mt-4">
                  <LanguageToggle />
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
              <p className="text-xs text-subtle">{t('landing.footer.rights')}</p>
              <p className="text-xs text-subtle">{t('landing.hero.note')}</p>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
