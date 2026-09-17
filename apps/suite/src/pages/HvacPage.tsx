import { useMemo, useState } from 'react';
import { Phone, Mail, Globe, CalendarCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import { useSuite, scheduleHvac, type HvacRequest } from '../demo/store';
import { extractServiceRequest } from '../demo/extract';
import { cn } from '../lib/cn';
import type { TranslationKey } from '../i18n/translations';

const CHANNEL_ICON = { call: Phone, mail: Mail, form: Globe } as const;
const URGENCY_CLS = { low: 'text-ink-soft', high: 'text-sev-warn', crit: 'text-sev-bad' } as const;

function RequestDetail({ req }: { req: HvacRequest }) {
  const { t, lang } = useI18n();
  const { hvacTechs } = useSuite();
  const [tech, setTech] = useState(req.suggestedTech);
  const [slot, setSlot] = useState(req.suggestedSlot);
  const [body, setBody] = useState(req.body);
  const extracted = useMemo(() => extractServiceRequest(body), [body]);
  // Fixture values are fallback suggestions; extracted values win when present.
  const device = extracted.device ?? req.device;
  const address = extracted.address ?? req.address;
  const urgency = extracted.device || extracted.address ? extracted.urgency : req.urgency;

  const confirm =
    lang === 'de'
      ? `Guten Tag ${req.customer},\n\nIhr Termin ist bestätigt: ${slot}. Unser Techniker ${tech} kümmert sich um: ${req.summary}.\n\nMit freundlichen Grüßen\nKlima-Service Maier`
      : `Hello ${req.customer},\n\nyour appointment is confirmed: ${slot}. Our technician ${tech} will take care of: ${req.summary}.\n\nBest regards\nKlima-Service Maier`;

  return (
    <div className="rounded-2xl bg-neu-raised p-5 shadow-neu">
      <p className="font-mono text-xs text-subtle">{req.id} · {t(`hvac.channel.${req.channel}` as TranslationKey)}</p>
      <h3 className="mt-1 font-display text-lg font-bold text-ink">{req.customer}</h3>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        aria-label={t('hvac.requestText')}
        className="mt-3 w-full resize-y rounded-xl bg-neu-inset p-3.5 font-mono text-xs leading-relaxed text-ink shadow-neu-in focus:outline-none focus:ring-2 focus:ring-hvac"
      />
      <p className="mt-1.5 text-[11px] text-subtle">{t('hvac.extractNote')}</p>

      <div className="mt-4 rounded-xl bg-neu-inset p-4 shadow-neu-in">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{t('hvac.extracted')}</p>
          <p className="font-mono text-[10px] text-subtle">{Math.round(extracted.confidence * 100)}%</p>
        </div>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-subtle">{t('hvac.device')}</dt><dd className="font-medium text-ink">{device}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-subtle">{t('hvac.address')}</dt><dd className="text-right font-medium text-ink">{address}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-subtle">{t('hvac.urgency')}</dt><dd className={cn('font-semibold', URGENCY_CLS[urgency])}>{t(`hvac.urgency.${urgency}` as TranslationKey)}</dd></div>
          {extracted.window && (
            <div className="flex justify-between gap-3"><dt className="text-subtle">{t('hvac.window')}</dt><dd className="font-medium text-ink">{extracted.window}</dd></div>
          )}
        </dl>
      </div>

      {!req.scheduled ? (
        <>
          <div className="mt-4 rounded-xl bg-neu-inset p-4 shadow-neu-in">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">{t('hvac.suggest')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <select value={tech} onChange={(e) => setTech(e.target.value)} aria-label={t('hvac.suggest')}
                className="rounded-lg bg-neu-raised px-3 py-2 text-sm font-medium text-ink shadow-neu-in focus:outline-none focus:ring-2 focus:ring-hvac">
                {hvacTechs.map((x) => <option key={x.id} value={x.name}>{x.name} — {x.skills}</option>)}
              </select>
              <input value={slot} onChange={(e) => setSlot(e.target.value)} aria-label={t('hvac.suggest')}
                className="rounded-lg bg-neu-raised px-3 py-2 font-mono text-sm text-ink shadow-neu-in focus:outline-none focus:ring-2 focus:ring-hvac" />
            </div>
          </div>
          <button type="button" onClick={() => scheduleHvac(req.id, tech, slot)}
            className="mt-4 w-full rounded-xl bg-hvac px-4 py-2.5 text-sm font-semibold text-hvac-ink shadow-neu-sm transition-all hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-hvac">
            {t('hvac.assign')}
          </button>
        </>
      ) : (
        <>
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-hvac">
            <CalendarCheck className="h-4 w-4" />
            {t('hvac.assigned')}: {req.scheduled.tech} · {req.scheduled.slot}
          </p>
          <div className="mt-3 rounded-xl bg-neu-inset p-4 shadow-neu-in">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">{t('hvac.confirmDraft')}</p>
            <p className="whitespace-pre-line font-mono text-xs leading-relaxed text-ink">{confirm}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function HvacPage() {
  const { t } = useI18n();
  const { hvacRequests } = useSuite();
  const [selected, setSelected] = useState<string>(hvacRequests[0].id);
  const req = hvacRequests.find((r) => r.id === selected) ?? hvacRequests[0];

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{t('hvac.title')}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t('hvac.sub')}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-3">
            {hvacRequests.map((r) => {
              const Icon = CHANNEL_ICON[r.channel];
              return (
                <button key={r.id} type="button" onClick={() => setSelected(r.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl bg-neu-raised p-4 text-left shadow-neu-sm transition-all focus:outline-none focus:ring-2 focus:ring-hvac',
                    r.id === selected && 'ring-2 ring-hvac'
                  )}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neu-inset text-ink-soft shadow-neu-in">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-display text-sm font-semibold text-ink">{r.customer}</span>
                      <span className={cn('shrink-0 text-xs font-semibold', URGENCY_CLS[r.urgency])}>{t(`hvac.urgency.${r.urgency}` as TranslationKey)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-soft">{r.summary}</span>
                  </span>
                  {r.scheduled && <CalendarCheck className="h-4 w-4 shrink-0 text-hvac" />}
                </button>
              );
            })}
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <RequestDetail key={req.id} req={req} />
          </div>
        </div>
      </main>
    </>
  );
}
