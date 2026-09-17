import { Link } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Camera,
  FileText,
  MapPin,
  PackageCheck,
  Route,
  Truck,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import type { TranslationKey } from '../i18n/translations';

// Pilot inquiries land here — replace when a dedicated company address exists.
const PILOT_CONTACT = 'amisha223singh@gmail.com';

// The fleet app deploys beside this one on the same Pages site.
const FLEET_BASE = `${import.meta.env.BASE_URL}fleet/`;

type Stage = {
  no: string;
  title: TranslationKey;
  desc: TranslationKey;
  artifact: 'order' | 'confirm' | 'risk' | 'tour' | 'pod' | 'invoice';
};

const STAGES_EINKAUF: Stage[] = [
  { no: '1.0', title: 'landing.stage1.title', desc: 'landing.stage1.desc', artifact: 'order' },
  { no: '2.0', title: 'landing.stage2.title', desc: 'landing.stage2.desc', artifact: 'confirm' },
  { no: '3.0', title: 'landing.stage3.title', desc: 'landing.stage3.desc', artifact: 'risk' },
];

const STAGES_FRACHT: Stage[] = [
  { no: '4.0', title: 'landing.stage4.title', desc: 'landing.stage4.desc', artifact: 'tour' },
  { no: '5.0', title: 'landing.stage5.title', desc: 'landing.stage5.desc', artifact: 'pod' },
  { no: '6.0', title: 'landing.stage6.title', desc: 'landing.stage6.desc', artifact: 'invoice' },
];

// Small product artifacts — honest UI fragments, no fake device chrome.
function Artifact({ kind, tone }: { kind: Stage['artifact']; tone: 'accent' | 'fork' }) {
  const { t } = useI18n();
  const chip = tone === 'accent' ? 'text-accent' : 'text-fork';
  const bar = tone === 'accent' ? 'bg-accent' : 'bg-fork';
  const content: Record<Stage['artifact'], ReactNode> = {
    order: (
      <>
        <span className="font-mono text-xs text-ink">PO-2026-118</span>
        <span className="font-mono text-xs text-subtle">4.200 Stk</span>
        <span className={`ml-auto h-2 w-2 rounded-full ${bar}`} />
      </>
    ),
    confirm: (
      <>
        <PackageCheck className={`h-3.5 w-3.5 ${chip}`} />
        <span className="text-xs font-medium text-ink">{t('landing.art.confirm')}</span>
        <span className="ml-auto font-mono text-[10px] text-subtle">{t('landing.art.confirmMeta')}</span>
      </>
    ),
    risk: (
      <>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-risk-red" />
          <span className="h-2 w-2 rounded-full bg-risk-yellow/40" />
          <span className="h-2 w-2 rounded-full bg-risk-green/40" />
        </span>
        <span className="text-xs font-medium text-ink">{t('landing.art.risk')}</span>
        <span className="ml-auto font-mono text-[10px] text-subtle">T+2</span>
      </>
    ),
    tour: (
      <>
        <Truck className={`h-3.5 w-3.5 ${chip}`} />
        <span className="font-mono text-xs text-ink">BG-1042</span>
        <span className="ml-auto text-xs text-subtle">→ München</span>
      </>
    ),
    pod: (
      <>
        <Camera className={`h-3.5 w-3.5 ${chip}`} />
        <span className="text-xs font-medium text-ink">{t('landing.art.pod')}</span>
        <span className="ml-auto font-mono text-[10px] text-subtle">{t('landing.art.podMeta')}</span>
      </>
    ),
    invoice: (
      <>
        <FileText className={`h-3.5 w-3.5 ${chip}`} />
        <span className="font-mono text-xs text-ink">RE-2026-0041</span>
        <span className="ml-auto font-mono text-[10px] text-subtle">PDF</span>
      </>
    ),
  };
  return (
    <div className="clay-pill flex w-full max-w-xs items-center gap-2 px-4 py-2.5" aria-hidden>
      {content[kind]}
    </div>
  );
}

// One journey stage: text block + spine node. Alternates sides on desktop.
function StageRow({ stage, side, tone, index }: { stage: Stage; side: 'left' | 'right'; tone: 'accent' | 'fork'; index: number }) {
  const { t } = useI18n();
  const tagColor = tone === 'accent' ? 'text-accent' : 'text-fork';
  const nodeDot = tone === 'accent' ? 'bg-accent' : 'bg-fork';
  const text = (
    <div className={side === 'left' ? 'md:text-right md:pr-2' : 'md:pl-2'}>
      <p className={`font-mono text-[11px] font-medium uppercase tracking-[0.14em] ${tagColor}`}>
        {stage.no} · {t(tone === 'accent' ? 'landing.side.einkauf' : 'landing.side.fracht')}
      </p>
      <h3 className="mt-1.5 font-display text-xl font-semibold text-ink">{t(stage.title)}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(stage.desc)}</p>
    </div>
  );
  const artifact = (
    <div className={`mt-3 flex md:mt-0 md:items-center ${side === 'left' ? 'md:justify-start md:pl-2' : 'md:justify-end md:pr-2'}`}>
      <Artifact kind={stage.artifact} tone={tone} />
    </div>
  );
  return (
    <div className="reveal relative grid gap-3 py-6 md:grid-cols-[1fr_4rem_1fr] md:gap-0 md:py-8" style={{ ['--i' as string]: index + 2 }}>
      {/* spine segment — tinted by the branch it belongs to */}
      <div
        className={`absolute left-[7px] top-0 h-full w-px md:left-1/2 md:-translate-x-1/2 ${tone === 'accent' ? 'bg-accent/25' : 'bg-fork/35'}`}
        aria-hidden
      />
      <div
        className={`absolute left-0 top-8 flex h-4 w-4 items-center justify-center rounded-full bg-clay shadow-[2px_2px_6px_var(--shadow-dark),-2px_-2px_6px_var(--shadow-light)] md:left-1/2 md:-translate-x-1/2`}
        aria-hidden
      >
        <span className={`h-1.5 w-1.5 rounded-full ${nodeDot}`} />
      </div>
      {/* text + artifact alternate around the spine */}
      <div className="pl-7 md:pl-0 md:contents">
        {side === 'left' ? (
          <>
            <div>{text}</div>
            <div className="hidden md:block" />
            <div>{artifact}</div>
          </>
        ) : (
          <>
            <div className="hidden md:block md:order-1">{artifact}</div>
            <div className="hidden md:block md:order-2" />
            <div className="md:order-3">{text}</div>
          </>
        )}
      </div>
    </div>
  );
}

// The fork: the delivery date's trunk splits — blue keeps watching, amber drives.
function Fork() {
  const { t } = useI18n();
  return (
    <div className="relative py-6 md:py-4">
      {/* mobile: the spine just continues */}
      <div className="absolute left-[7px] top-0 h-full w-px bg-rule md:hidden" aria-hidden />
      <div className="relative mx-auto w-fit pl-7 md:pl-0">
        <svg viewBox="0 0 320 140" className="mx-auto hidden h-36 w-80 md:block" aria-hidden>
          {/* trunk in */}
          <path d="M160 0 V34" stroke="var(--color-accent)" strokeWidth="2" fill="none" />
          {/* left branch — Einkauf keeps watching */}
          <path d="M160 34 C160 78 84 84 84 118" stroke="var(--color-accent)" strokeWidth="2" fill="none" className="route-draw" />
          {/* right branch — FrachtRadar drives */}
          <path d="M160 34 C160 78 236 84 236 118" stroke="var(--color-fork)" strokeWidth="2" fill="none" className="route-draw" />
          <circle cx="160" cy="34" r="5" fill="var(--color-clay)" stroke="var(--color-rule)" strokeWidth="1.5" />
          <circle cx="84" cy="118" r="6" fill="var(--color-accent)" />
          <circle cx="236" cy="118" r="6" fill="var(--color-fork)" />
        </svg>
        {/* branch labels under each end */}
        <div className="hidden justify-between md:flex md:w-80">
          <span className="-ml-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
            {t('landing.side.einkauf')}
          </span>
          <span className="-mr-6 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-fork">
            {t('landing.side.fracht')}
          </span>
        </div>
        <div className="mx-auto mt-4 max-w-md text-left md:text-center">
          <p className="font-display text-lg font-semibold text-ink">{t('landing.fork.title')}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t('landing.fork.desc')}</p>
        </div>
      </div>
    </div>
  );
}

// Dimensional hero composition — a soft delivery clock on a route. Hand-built SVG, no chrome.
function ClayScene() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <svg viewBox="0 0 400 340" className="w-full">
        <defs>
          <radialGradient id="clayBody" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="oklch(99.4% 0.003 250)" />
            <stop offset="60%" stopColor="var(--color-clay)" />
            <stop offset="100%" stopColor="oklch(93% 0.012 252)" />
          </radialGradient>
          <radialGradient id="clayDial" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="var(--color-paper-2)" />
            <stop offset="100%" stopColor="oklch(91.5% 0.011 252)" />
          </radialGradient>
          <radialGradient id="clayPin" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="oklch(76% 0.19 55)" />
            <stop offset="100%" stopColor="var(--color-fork)" />
          </radialGradient>
          <radialGradient id="clayBlue" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="oklch(62% 0.17 262)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </radialGradient>
        </defs>

        {/* route line threading the scene */}
        <path
          d="M24 288 C110 250 120 130 210 128 C290 126 300 190 372 176"
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="3"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
        <path
          d="M24 288 C110 250 120 130 210 128"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="route-draw"
          style={{ ['--dash' as string]: 320 }}
        />

        {/* ground shadow */}
        <ellipse cx="200" cy="296" rx="118" ry="16" fill="var(--shadow-dark)" opacity="0.55" />

        {/* clock body */}
        <g style={{ filter: 'drop-shadow(14px 18px 24px oklch(70% 0.02 255 / 0.45)) drop-shadow(-8px -8px 16px oklch(100% 0 0 / 0.8))' }}>
          <circle cx="200" cy="160" r="104" fill="url(#clayBody)" />
        </g>
        <circle cx="200" cy="160" r="104" fill="none" stroke="oklch(100% 0 0 / 0.7)" strokeWidth="1.5" />
        {/* inset dial */}
        <circle cx="200" cy="160" r="80" fill="url(#clayDial)" stroke="oklch(84% 0.012 255)" strokeWidth="1" />
        {/* dial ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="200" y1="88" x2="200" y2={deg % 90 === 0 ? '98' : '93'}
            stroke="var(--color-muted)"
            strokeWidth={deg % 90 === 0 ? 3 : 1.5}
            strokeLinecap="round"
            transform={`rotate(${deg} 200 160)`}
          />
        ))}
        {/* hands — 14:25, a delivery time */}
        <line x1="200" y1="160" x2="200" y2="102" stroke="var(--color-ink)" strokeWidth="6" strokeLinecap="round" transform="rotate(132 200 160)" />
        <line x1="200" y1="160" x2="200" y2="122" stroke="var(--color-ink)" strokeWidth="8" strokeLinecap="round" transform="rotate(72 200 160)" />
        <line x1="200" y1="168" x2="200" y2="96" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="200" cy="160" r="9" fill="url(#clayBlue)" />
        <circle cx="200" cy="160" r="3.5" fill="var(--color-accent-ink)" />

        {/* clay destination pin at route end */}
        <g style={{ filter: 'drop-shadow(6px 8px 12px oklch(60% 0.06 55 / 0.4))' }}>
          <path
            d="M352 150 c-13 0 -22 9 -22 21 0 15 22 33 22 33 s22 -18 22 -33 c0 -12 -9 -21 -22 -21z"
            fill="url(#clayPin)"
          />
        </g>
        <circle cx="352" cy="170" r="8" fill="var(--color-fork-ink)" />

        {/* small truck on the route */}
        <g transform="translate(118 208) rotate(-24)" style={{ filter: 'drop-shadow(5px 7px 10px oklch(70% 0.02 255 / 0.5))' }}>
          <rect x="0" y="0" width="34" height="20" rx="6" fill="url(#clayBlue)" />
          <rect x="34" y="6" width="14" height="14" rx="4" fill="url(#clayBlue)" />
          <circle cx="11" cy="22" r="5" fill="var(--color-ink)" />
          <circle cx="38" cy="22" r="5" fill="var(--color-ink)" />
        </g>
      </svg>

      {/* floating data satellites */}
      <div className="clay-pill absolute -left-2 top-8 flex items-center gap-1.5 px-3 py-1.5 reveal" style={{ ['--i' as string]: 3 }}>
        <MapPin className="h-3 w-3 text-accent" />
        <span className="font-mono text-[11px] text-ink">ETA 14:30</span>
      </div>
      <div className="clay-pill absolute -right-1 bottom-16 flex items-center gap-1.5 px-3 py-1.5 reveal" style={{ ['--i' as string]: 4 }}>
        <Route className="h-3 w-3 text-fork" />
        <span className="font-mono text-[11px] text-ink">POD ✓</span>
      </div>
    </div>
  );
}

function DemoDot({ tone }: { tone: 'accent' | 'fork' }) {
  return <span className={`h-2 w-2 rounded-full ${tone === 'accent' ? 'bg-accent' : 'bg-fork'}`} aria-hidden />;
}

export function LandingPage() {
  const { t } = useI18n();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-paper text-ink" id="top">
        {/* N5 floating pill nav — both demos are equal peers */}
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
              href="#weg"
              className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline"
            >
              {t('landing.nav.journey')}
            </a>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-transform duration-150 hover:-translate-y-px"
            >
              <DemoDot tone="accent" />
              <span className="sm:hidden">Einkauf</span>
              <span className="hidden sm:inline">{t('landing.nav.demoEinkauf')}</span>
            </Link>
            <a
              href={FLEET_BASE}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-fork px-3 py-1.5 text-sm font-medium text-fork-ink transition-transform duration-150 hover:-translate-y-px"
            >
              <DemoDot tone="fork" />
              <span className="sm:hidden">FrachtRadar</span>
              <span className="hidden sm:inline">{t('landing.nav.demoFracht')}</span>
            </a>
            <LanguageToggle />
          </nav>
        </header>

        <main>
          {/* Hero — left-biased, clay clock composition right */}
          <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-32 md:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
            <div>
              <h1
                className="reveal font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink text-balance sm:text-5xl lg:text-[3.4rem]"
                style={{ ['--i' as string]: 0 }}
              >
                {t('landing.hero.title')}
              </h1>
              <p className="reveal mt-5 max-w-xl text-lg leading-relaxed text-ink-soft" style={{ ['--i' as string]: 1 }}>
                {t('landing.hero.sub')}
              </p>
              <div className="reveal mt-7 flex flex-wrap items-center gap-3" style={{ ['--i' as string]: 2 }}>
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
              <p className="reveal mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle" style={{ ['--i' as string]: 3 }}>
                {t('landing.hero.note')}
              </p>
            </div>
            <ClayScene />
          </section>

          {/* The journey — Narrative Workflow: one date, told in stages */}
          <section id="weg" className="mx-auto max-w-5xl scroll-mt-24 px-5 pb-8 pt-10">
            <div className="mb-4 max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {t('landing.journey.title')}
              </h2>
              <p className="mt-3 text-ink-soft">{t('landing.journey.sub')}</p>
            </div>
            <div>
              {STAGES_EINKAUF.map((stage, i) => (
                <StageRow key={stage.no} stage={stage} index={i} tone="accent" side={i % 2 === 0 ? 'left' : 'right'} />
              ))}
            </div>
            <Fork />
            <div>
              {STAGES_FRACHT.map((stage, i) => (
                <StageRow key={stage.no} stage={stage} index={i} tone="fork" side={i % 2 === 0 ? 'right' : 'left'} />
              ))}
            </div>
          </section>

          {/* Two doors — equal product entry points */}
          <section className="mx-auto max-w-6xl px-5 py-16">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {t('landing.doors.title')}
              </h2>
              <p className="mt-3 text-ink-soft">{t('landing.doors.sub')}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Einkauf door — the whole card is the demo link */}
              <div className="clay-card group relative flex flex-col p-7 transition-transform duration-200 hover:-translate-y-1 md:p-9">
                <Link to="/dashboard" className="absolute inset-0 z-0 rounded-[1.25rem]" aria-label={t('landing.einkauf.demo')} />
                <div className="pointer-events-none flex items-center gap-3">
                  <span className="clay-pill flex h-11 w-11 items-center justify-center">
                    <BrandMark className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">{t('landing.einkauf.name')}</h3>
                    <p className="text-sm font-medium text-accent">{t('landing.einkauf.audience')}</p>
                  </div>
                </div>
                <figure className="pointer-events-none mt-6 overflow-hidden rounded-xl border border-rule bg-paper-2">
                  <img
                    src={`${import.meta.env.BASE_URL}tour/dashboard.png`}
                    alt={t('landing.einkauf.shotAlt')}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover object-top"
                  />
                </figure>
                <p className="pointer-events-none mt-5 leading-relaxed text-ink-soft">{t('landing.einkauf.desc')}</p>
                <ul className="pointer-events-none mt-5 space-y-2.5">
                  {(['landing.einkauf.f1', 'landing.einkauf.f2', 'landing.einkauf.f3'] as const).map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
                  <span className="pointer-events-none flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink">
                    {t('landing.einkauf.demo')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                  <Link to="/s/demo" className="relative z-10 text-sm font-medium text-accent hover:underline">
                    {t('landing.einkauf.demoAlt')}
                  </Link>
                </div>
              </div>

              {/* FrachtRadar door — the whole card is the demo link */}
              <div className="clay-card group relative flex flex-col p-7 transition-transform duration-200 hover:-translate-y-1 md:p-9">
                <a href={FLEET_BASE} className="absolute inset-0 z-0 rounded-[1.25rem]" aria-label={t('landing.fracht.demo')} />
                <div className="pointer-events-none flex items-center gap-3">
                  <span className="clay-pill flex h-11 w-11 items-center justify-center">
                    <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden>
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
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {t('landing.fracht.name')}
                      <span className="ml-2 text-sm font-medium text-subtle">{t('landing.fracht.by')}</span>
                    </h3>
                    <p className="text-sm font-medium text-fork">{t('landing.fracht.audience')}</p>
                  </div>
                </div>
                <figure className="pointer-events-none mt-6 overflow-hidden rounded-xl border border-rule bg-paper-2">
                  <img
                    src={`${import.meta.env.BASE_URL}tour/dispatch.png`}
                    alt={t('landing.fracht.shotAlt')}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover object-top"
                  />
                </figure>
                <p className="pointer-events-none mt-5 leading-relaxed text-ink-soft">{t('landing.fracht.desc')}</p>
                <ul className="pointer-events-none mt-5 space-y-2.5">
                  {(['landing.fracht.f1', 'landing.fracht.f2', 'landing.fracht.f3'] as const).map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fork" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
                  <span className="pointer-events-none flex items-center gap-2 rounded-full bg-fork px-5 py-2.5 text-sm font-semibold text-fork-ink">
                    {t('landing.fracht.demo')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                  <a href={`${FLEET_BASE}#/t/demo`} className="relative z-10 text-sm font-medium text-fork hover:underline">
                    {t('landing.fracht.demoDriver')}
                  </a>
                  <a href={`${FLEET_BASE}#/l/demo`} className="relative z-10 text-sm font-medium text-fork hover:underline">
                    {t('landing.fracht.demoTrack')}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Why + integrations — quiet two-column text, no card-in-card */}
          <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{t('landing.why.title')}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{t('landing.why.desc')}</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{t('landing.integrations.title')}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{t('landing.integrations.desc')}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['REST API', 'Webhooks', 'n8n · Make · Zapier', t('landing.integrations.mcp'), 'CSV', t('landing.integrations.erp')].map(
                  (chip) => (
                    <span key={chip} className="clay-pill px-3.5 py-1.5 text-xs font-medium text-ink-soft">
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* Pilot CTA — statement, single action */}
          <section className="mx-auto max-w-6xl px-5 pb-24">
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

        {/* Ft5 statement footer */}
        <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4">
          <p className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl md:max-w-2xl">
            {t('landing.footer.line')}
          </p>
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 border-t border-rule pt-5">
            <span className="flex items-center gap-2">
              <BrandMark className="h-5 w-5" />
              <span className="font-display text-sm font-semibold text-ink">Lieferuhr</span>
            </span>
            <p className="text-sm text-subtle">
              {t('landing.footer.full')}{' '}
              <a
                href="https://github.com/0-uddeshya-0/LieferUhr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                {t('landing.footer.repo')}
              </a>
            </p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
