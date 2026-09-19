import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  Github,
  Mail,
  Navigation,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import type { TranslationKey } from '../i18n/translations';

// Pilot inquiries land here — replace when a dedicated company address exists.
const PILOT_CONTACT = 'uddeshyasingh.de@gmail.com';

const BASE = import.meta.env.BASE_URL;
// The fleet and suite apps deploy beside this one on the same Pages site.
const FLEET_BASE = `${BASE}fleet/`;
const SUITE_BASE = `${BASE}suite/`;

type Tone = 'accent' | 'fork' | 'tool-dispatch' | 'tool-comply' | 'tool-depot';

type Product = {
  id: 'einkauf' | 'frachtradar' | 'frachtamt' | 'pruefamt' | 'postamt';
  tone: Tone;
  name: TranslationKey;
  forWhom: TranslationKey;
  what: TranslationKey;
  how: [TranslationKey, TranslationKey, TranslationKey];
  monday: TranslationKey;
  demo: TranslationKey;
  href: string;
  external?: boolean;
};

type Cluster = {
  id: 'fracht' | 'handel';
  title: TranslationKey;
  sub: TranslationKey;
  products: Product[];
};

// Two worlds, five tools — order inside each cluster follows the real workflow.
const CLUSTERS: Cluster[] = [
  {
    id: 'fracht',
    title: 'landing.cluster.fracht.title',
    sub: 'landing.cluster.fracht.sub',
    products: [
      {
        id: 'frachtamt',
        tone: 'tool-dispatch',
        name: 'landing.p.frachtamt.name',
        forWhom: 'landing.p.frachtamt.for',
        what: 'landing.p.frachtamt.what',
        how: ['landing.p.frachtamt.how1', 'landing.p.frachtamt.how2', 'landing.p.frachtamt.how3'],
        monday: 'landing.p.frachtamt.monday',
        demo: 'landing.p.frachtamt.demo',
        href: `${SUITE_BASE}#/frachtamt`,
        external: true,
      },
      {
        id: 'frachtradar',
        tone: 'fork',
        name: 'landing.p.frachtradar.name',
        forWhom: 'landing.p.frachtradar.for',
        what: 'landing.p.frachtradar.what',
        how: ['landing.p.frachtradar.how1', 'landing.p.frachtradar.how2', 'landing.p.frachtradar.how3'],
        monday: 'landing.p.frachtradar.monday',
        demo: 'landing.p.frachtradar.demo',
        href: `${FLEET_BASE}#/dispatch`,
        external: true,
      },
      {
        id: 'pruefamt',
        tone: 'tool-comply',
        name: 'landing.p.pruefamt.name',
        forWhom: 'landing.p.pruefamt.for',
        what: 'landing.p.pruefamt.what',
        how: ['landing.p.pruefamt.how1', 'landing.p.pruefamt.how2', 'landing.p.pruefamt.how3'],
        monday: 'landing.p.pruefamt.monday',
        demo: 'landing.p.pruefamt.demo',
        href: `${SUITE_BASE}#/pruefamt`,
        external: true,
      },
    ],
  },
  {
    id: 'handel',
    title: 'landing.cluster.handel.title',
    sub: 'landing.cluster.handel.sub',
    products: [
      {
        id: 'einkauf',
        tone: 'accent',
        name: 'landing.p.einkauf.name',
        forWhom: 'landing.p.einkauf.for',
        what: 'landing.p.einkauf.what',
        how: ['landing.p.einkauf.how1', 'landing.p.einkauf.how2', 'landing.p.einkauf.how3'],
        monday: 'landing.p.einkauf.monday',
        demo: 'landing.p.einkauf.demo',
        href: '/dashboard',
      },
      {
        id: 'postamt',
        tone: 'tool-depot',
        name: 'landing.p.postamt.name',
        forWhom: 'landing.p.postamt.for',
        what: 'landing.p.postamt.what',
        how: ['landing.p.postamt.how1', 'landing.p.postamt.how2', 'landing.p.postamt.how3'],
        monday: 'landing.p.postamt.monday',
        demo: 'landing.p.postamt.demo',
        href: `${SUITE_BASE}#/postamt`,
        external: true,
      },
    ],
  },
];

const ALL_PRODUCTS = CLUSTERS.flatMap((c) => c.products);

const TOOL_ICONS: Partial<Record<Product['id'], typeof Navigation>> = {
  frachtamt: Navigation,
  pruefamt: CalendarClock,
  postamt: Boxes,
};

// HashRouter owns location.hash — in-page anchors must scroll without
// touching it, otherwise every click is parsed as a route change.
const scrollToId = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Static tone classes — Tailwind needs literals at build time.
const TONES: Record<Tone, { text: string; bg: string; bgSoft: string }> = {
  accent: { text: 'text-accent', bg: 'bg-accent', bgSoft: 'bg-accent/10' },
  fork: { text: 'text-fork', bg: 'bg-fork', bgSoft: 'bg-fork/10' },
  'tool-dispatch': { text: 'text-tool-dispatch', bg: 'bg-tool-dispatch', bgSoft: 'bg-tool-dispatch/10' },
  'tool-comply': { text: 'text-tool-comply', bg: 'bg-tool-comply', bgSoft: 'bg-tool-comply/10' },
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
  const Icon = TOOL_ICONS[product.id] ?? Navigation;
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

// One product block: für wen → was → so läuft es → am Montag anders + demo.
function ProductBlock({ product, flip }: { product: Product; flip: boolean }) {
  const { t } = useI18n();
  const accentText = TONES[product.tone].text;
  const accentBg = TONES[product.tone].bg;
  const text = (
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-4">
        <ProductMark product={product} />
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{t(product.name)}</h3>
          <p className={`mt-0.5 text-sm font-medium ${accentText}`}>{t(product.forWhom)}</p>
        </div>
      </div>
      <p className="mt-5 leading-relaxed text-ink-soft">{t(product.what)}</p>
      <ol className="mt-5 space-y-2">
        {product.how.map((key, i) => (
          <li key={key} className="flex items-center gap-2.5 text-sm text-ink">
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${TONES[product.tone].bgSoft} font-mono text-[10px] font-semibold ${accentText}`}
            >
              {i + 1}
            </span>
            <span>{t(key)}</span>
            {i < product.how.length - 1 && (
              <ArrowRight className="h-3 w-3 shrink-0 text-subtle" aria-hidden />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-5 border-l-2 pl-3.5 text-sm italic leading-relaxed text-ink-soft" style={{ borderColor: 'var(--color-rule)' }}>
        {t(product.monday)}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
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
            {t('landing.p.einkauf.demoAlt')}
          </Link>
        )}
        {product.id === 'frachtradar' && (
          <>
            <a href={`${FLEET_BASE}#/t/demo`} className="text-sm font-medium text-fork hover:underline">
              {t('landing.p.frachtradar.demoDriver')}
            </a>
            <a href={`${FLEET_BASE}#/l/demo`} className="text-sm font-medium text-fork hover:underline">
              {t('landing.p.frachtradar.demoTrack')}
            </a>
          </>
        )}
      </div>
    </div>
  );
  return (
    <article id={`prod-${product.id}`} className="scroll-mt-28 py-10 md:py-12">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={flip ? 'lg:order-2' : ''}>{text}</div>
        <div className={flip ? 'lg:order-1' : ''}>
          <ProductVideo product={product} />
        </div>
      </div>
    </article>
  );
}

// Flow chain — chips connected by arrows; a labeled edge marks a product handoff.
function FlowStep({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`clay-pill whitespace-nowrap px-3 py-1.5 text-xs font-medium ${TONES[tone].text}`}>
      {label}
    </span>
  );
}

export function LandingPage() {
  const { t } = useI18n();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-paper text-ink" id="top">
        {/* Floating pill nav — wordmark, audience links, pilot, language */}
        <header>
          <nav
            aria-label="Primary"
            className="clay-pill fixed left-1/2 top-4 z-50 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 py-2 pl-3 pr-2 sm:gap-2 sm:pl-4"
          >
            <a href="#top" onClick={scrollToId('top')} className="mr-1 flex items-center gap-2">
              <BrandMark className="h-6 w-6" />
              <span className="hidden font-display text-sm font-semibold text-ink min-[430px]:inline">Lieferuhr</span>
            </a>
            <a
              href="#fracht"
              onClick={scrollToId('fracht')}
              className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline"
            >
              {t('landing.nav.fracht')}
            </a>
            <a
              href="#handel"
              onClick={scrollToId('handel')}
              className="hidden whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline"
            >
              {t('landing.nav.handel')}
            </a>
            <a
              href="#integration"
              onClick={scrollToId('integration')}
              className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink lg:inline"
            >
              {t('landing.nav.integration')}
            </a>
            <a
              href="#kontakt"
              onClick={scrollToId('kontakt')}
              className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline"
            >
              {t('landing.nav.pilot')}
            </a>
            <a
              href="#werke"
              onClick={scrollToId('werke')}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-ink transition-transform duration-150 hover:-translate-y-px"
            >
              {t('landing.nav.demo')}
            </a>
            <LanguageToggle />
          </nav>
        </header>

        <main>
          {/* Hero — sells the shared mechanism, not the container */}
          <section className="mx-auto max-w-4xl px-5 pb-12 pt-32 text-center md:pt-36">
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
            <div className="reveal mt-7" style={{ ['--i' as string]: 3 }}>
              <a
                href="#werke"
                onClick={scrollToId('werke')}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-transform duration-150 hover:-translate-y-px"
              >
                {t('landing.hero.cta')}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="reveal mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle" style={{ ['--i' as string]: 4 }}>
              {t('landing.hero.note')}
            </p>
          </section>

          {/* Self-selection — "Wo arbeiten Sie?" answers who before what */}
          <section id="werke" className="mx-auto max-w-5xl scroll-mt-28 px-5 pb-6">
            <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t('landing.pick.title')}
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <a
                href="#fracht"
                onClick={scrollToId('fracht')}
                className="clay-card group p-7 transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fork">{t('landing.pick.fracht.kicker')}</p>
                <h3 className="mt-2.5 font-display text-xl font-bold text-ink">{t('landing.pick.fracht.title')}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{t('landing.pick.fracht.desc')}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-fork">
                  {t('landing.pick.fracht.cta')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
              <a
                href="#handel"
                onClick={scrollToId('handel')}
                className="clay-card group p-7 transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{t('landing.pick.handel.kicker')}</p>
                <h3 className="mt-2.5 font-display text-xl font-bold text-ink">{t('landing.pick.handel.title')}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{t('landing.pick.handel.desc')}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  {t('landing.pick.handel.cta')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            </div>
          </section>

          {/* Two clusters — each names its audience, then explains every tool */}
          {CLUSTERS.map((cluster) => (
            <section key={cluster.id} id={cluster.id} className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-14">
              <div className="max-w-2xl border-t border-rule/60 pt-10">
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {t(cluster.title)}
                </h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{t(cluster.sub)}</p>
              </div>
              <div className="divide-y divide-rule/60">
                {cluster.products.map((product, i) => (
                  <ProductBlock key={product.id} product={product} flip={i % 2 === 1} />
                ))}
              </div>
            </section>
          ))}

          {/* Proof — the two chains that actually connect products */}
          <section id="zusammen" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
            <div className="clay-inset px-6 py-10 md:px-10">
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {t('landing.flow.title')}
                </h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{t('landing.flow.sub')}</p>
              </div>
              <div className="mt-8 space-y-6">
                <div>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fork">
                    {t('landing.flow.fracht.label')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <FlowStep label={t('landing.flow.fracht.s1')} tone="tool-dispatch" />
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                    <FlowStep label={t('landing.flow.fracht.s2')} tone="tool-dispatch" />
                    <span className="inline-flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-wide text-subtle">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      {t('landing.flow.fracht.hand')}
                    </span>
                    <FlowStep label={t('landing.flow.fracht.s3')} tone="fork" />
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                    <FlowStep label={t('landing.flow.fracht.s4')} tone="fork" />
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                    <FlowStep label={t('landing.flow.fracht.s5')} tone="fork" />
                  </div>
                </div>
                <div>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                    {t('landing.flow.handel.label')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <FlowStep label={t('landing.flow.handel.s1')} tone="tool-depot" />
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                    <FlowStep label={t('landing.flow.handel.s2')} tone="tool-depot" />
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                    <FlowStep label={t('landing.flow.handel.s3')} tone="tool-depot" />
                    <span className="inline-flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-wide text-subtle">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      {t('landing.flow.handel.hand')}
                    </span>
                    <FlowStep label={t('landing.flow.handel.s4')} tone="accent" />
                  </div>
                </div>
                <p className="pt-1 text-sm italic text-subtle">{t('landing.flow.caption')}</p>
              </div>
            </div>
          </section>

          {/* Principles — the trust model in three lines */}
          <section className="mx-auto max-w-6xl px-5 pb-16">
            <div className="grid gap-5 md:grid-cols-3">
              {(
                [
                  ['landing.principles.link.title', 'landing.principles.link.desc'],
                  ['landing.principles.draft.title', 'landing.principles.draft.desc'],
                  ['landing.principles.privacy.title', 'landing.principles.privacy.desc'],
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
                  {[
                    'REST API',
                    t('landing.integrations.webhooks'),
                    'CSV-Import',
                    'MCP',
                    'n8n · Make · Zapier',
                    t('landing.integrations.erp'),
                  ].map((chip) => (
                    <span key={chip} className="clay-pill px-3.5 py-1.5 text-xs font-medium text-ink-soft">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Pilot CTA — all three audiences */}
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
                  {ALL_PRODUCTS.map((product) => (
                    <li key={product.id}>
                      <a
                        href={`#prod-${product.id}`}
                        onClick={scrollToId(`prod-${product.id}`)}
                        className="text-ink-soft transition-colors hover:text-ink"
                      >
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
                    <a
                      href="#integration"
                      onClick={scrollToId('integration')}
                      className="text-ink-soft transition-colors hover:text-ink"
                    >
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
