import { useState } from 'react';
import { Check, FileText, FileCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import { useSuite, counterOffer, setOfferStatus, handoffToFrachtRadar, type Offer } from '../demo/store';
import { cn } from '../lib/cn';
import type { TranslationKey } from '../i18n/translations';

const STATUS_ORDER = ['new', 'countered', 'won', 'lost'] as const;

function eur(cents: number, lang: 'de' | 'en') {
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);
}

function CounterBox({ offer, onDone }: { offer: Offer; onDone: () => void }) {
  const { t, lang } = useI18n();
  const suggested = Math.round(offer.rateCents * 1.12);
  const [rate, setRate] = useState(Math.round(suggested / 100));
  const draft =
    lang === 'de'
      ? `Sehr geehrte Damen und Herren,\n\nwir können die Ladung ${offer.from} → ${offer.to} übernehmen, allerdings zu ${eur(rate * 100, lang)} statt ${eur(offer.rateCents, lang)}. Abholung ${offer.pickup} ist bestätigt.\n\nMit freundlichen Grüßen\nSpedition Keller`
      : `Hello,\n\nwe can take the load ${offer.from} → ${offer.to}, but at ${eur(rate * 100, lang)} instead of ${eur(offer.rateCents, lang)}. Pickup ${offer.pickup} is confirmed.\n\nBest regards\nSpedition Keller`;
  return (
    <div className="mt-4 rounded-xl bg-neu-inset p-4 shadow-neu-in">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-subtle">{t('dispatch.counterDraft')}</label>
        <input
          type="number"
          value={rate}
          min={1}
          onChange={(e) => setRate(Number(e.target.value) || 0)}
          className="w-24 rounded-lg bg-neu-raised px-2 py-1 text-right font-mono text-sm text-ink shadow-neu-in focus:outline-none focus:ring-2 focus:ring-dispatch"
          aria-label={t('dispatch.rate')}
        />
      </div>
      <p className="whitespace-pre-line font-mono text-xs leading-relaxed text-ink">{draft}</p>
      <button
        type="button"
        onClick={() => { counterOffer(offer.id, rate * 100); onDone(); }}
        className="mt-3 w-full rounded-xl bg-dispatch px-4 py-2.5 text-sm font-semibold text-dispatch-ink shadow-neu-sm transition-all hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-dispatch"
      >
        {t('dispatch.counterSend')}
      </button>
    </div>
  );
}

function OfferDetail({ offer }: { offer: Offer }) {
  const { t, lang } = useI18n();
  const [countering, setCountering] = useState(false);
  const actionable = offer.status === 'new' || offer.status === 'countered';

  return (
    <div className="rounded-2xl bg-neu-raised p-5 shadow-neu">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-subtle">{offer.id} · {t('dispatch.broker')}: {offer.broker}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-ink">{offer.from} → {offer.to}</h3>
          <p className="mt-1 text-sm text-ink-soft">{offer.cargo}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-bold text-ink">{eur(offer.status === 'countered' && offer.counterCents ? offer.counterCents : offer.rateCents, lang)}</p>
          {offer.status === 'countered' && offer.counterCents && (
            <p className="font-mono text-xs text-subtle line-through">{eur(offer.rateCents, lang)}</p>
          )}
          <p className="mt-1 text-xs text-subtle">{t('dispatch.pickup')}: {offer.pickup}</p>
        </div>
      </div>

      {actionable && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => setCountering((v) => !v)}
            className="rounded-xl bg-neu-inset px-3 py-2 text-sm font-semibold text-ink shadow-neu-in transition-colors hover:text-dispatch focus:outline-none focus:ring-2 focus:ring-dispatch">
            {t('dispatch.counter')}
          </button>
          <button type="button" onClick={() => setOfferStatus(offer.id, 'won')}
            className="rounded-xl bg-dispatch px-3 py-2 text-sm font-semibold text-dispatch-ink shadow-neu-sm transition-all hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-dispatch">
            {t('dispatch.accept')}
          </button>
          <button type="button" onClick={() => setOfferStatus(offer.id, 'lost')}
            className="rounded-xl bg-neu-inset px-3 py-2 text-sm font-medium text-subtle shadow-neu-in transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-dispatch">
            {t('dispatch.decline')}
          </button>
        </div>
      )}
      {countering && actionable && <CounterBox offer={offer} onDone={() => setCountering(false)} />}

      {offer.status === 'won' && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-dispatch">{t('dispatch.won')}</p>
          <div className="rounded-xl bg-neu-inset p-3 shadow-neu-in">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">{t('dispatch.docs')}</p>
            <div className="space-y-1.5 text-sm text-ink">
              <p className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-dispatch" />{t('dispatch.doc.ratecon')}</p>
              <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-subtle" />{t('dispatch.doc.pod')} — {t('dispatch.doc.waiting')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handoffToFrachtRadar(offer.id)}
            disabled={offer.handedOff}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-neu-sm transition-all focus:outline-none focus:ring-2 focus:ring-dispatch',
              offer.handedOff ? 'bg-neu-inset text-subtle' : 'bg-fracht text-fracht-ink hover:brightness-105'
            )}
          >
            {offer.handedOff && <Check className="h-4 w-4" />}
            {offer.handedOff ? t('dispatch.handoffDone') : t('dispatch.handoff')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DispatchPage() {
  const { t, lang } = useI18n();
  const { offers } = useSuite();
  const [selected, setSelected] = useState<string>(offers[0].id);
  const offer = offers.find((o) => o.id === selected) ?? offers[0];

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{t('dispatch.title')}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t('dispatch.sub')}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {STATUS_ORDER.map((status) => {
              const group = offers.filter((o) => o.status === status);
              if (group.length === 0) return null;
              return (
                <section key={status}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
                    {t(`dispatch.col.${status}` as TranslationKey)} · {group.length}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelected(o.id)}
                        className={cn(
                          'rounded-2xl bg-neu-raised p-4 text-left shadow-neu-sm transition-all focus:outline-none focus:ring-2 focus:ring-dispatch',
                          o.id === selected && 'ring-2 ring-dispatch'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono text-xs text-subtle">{o.id}</p>
                          <p className="font-mono text-sm font-bold text-ink">{eur(o.rateCents, lang)}</p>
                        </div>
                        <p className="mt-1.5 font-display text-sm font-semibold text-ink">{o.from} → {o.to}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-soft">{o.broker} · {o.cargo}</p>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <OfferDetail key={offer.id} offer={offer} />
          </div>
        </div>
      </main>
    </>
  );
}
