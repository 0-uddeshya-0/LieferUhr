import { useMemo, useState } from 'react';
import { Mail, PackageCheck, Truck } from 'lucide-react';
import { useI18n } from '../i18n';
import { useSuite, createDepotOrder, shipDepotOrder, type DepotMail } from '../demo/store';
import { extractOrderLines } from '../demo/extract';
import { cn } from '../lib/cn';
import type { TranslationKey } from '../i18n/translations';

function MailDetail({ mail }: { mail: DepotMail }) {
  const { t } = useI18n();
  const { stock } = useSuite();
  const [body, setBody] = useState(mail.body);
  const extraction = useMemo(() => extractOrderLines(body, stock), [body, stock]);
  const matchedLines = extraction.lines.filter((l) => l.matched && l.sku);
  const nameOf = (sku?: string) => stock.find((s) => s.sku === sku)?.name;

  return (
    <div className="rounded-2xl bg-neu-raised p-5 shadow-neu">
      <p className="flex items-center gap-2 font-mono text-xs text-subtle"><Mail className="h-3.5 w-3.5" />{mail.from}</p>
      <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink">{mail.subject}</h3>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        aria-label={t('depot.mailBody')}
        className="mt-4 w-full resize-y rounded-xl bg-neu-inset p-3.5 font-mono text-xs leading-relaxed text-ink shadow-neu-in focus:outline-none focus:ring-2 focus:ring-depot"
      />
      <p className="mt-1.5 text-[11px] text-subtle">{t('depot.extractNote')}</p>

      <div className="mt-4 rounded-xl bg-neu-inset p-4 shadow-neu-in">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{t('depot.parsed')}</p>
          <p className="font-mono text-[10px] text-subtle">
            {t('depot.confidence')}: {Math.round(extraction.confidence * 100)}%
          </p>
        </div>
        {extraction.lines.length === 0 ? (
          <p className="py-2 text-sm text-ink-soft">{t('depot.noLines')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-subtle">
                <th className="pb-1.5 font-medium">{t('depot.sku')}</th>
                <th className="pb-1.5 font-medium">{t('depot.item')}</th>
                <th className="pb-1.5 text-right font-medium">{t('depot.qty')}</th>
              </tr>
            </thead>
            <tbody>
              {extraction.lines.map((l, i) => (
                <tr key={`${l.sku ?? 'x'}-${i}`} className="border-t border-rule">
                  <td className="py-1.5 font-mono text-xs text-ink-soft">{l.sku ?? '—'}</td>
                  <td className="py-1.5 text-ink">
                    {nameOf(l.sku) ?? l.name}
                    {!l.matched && <span className="ml-1.5 text-[10px] font-semibold uppercase text-sev-warn">{t('depot.unmatched')}</span>}
                  </td>
                  <td className="py-1.5 text-right font-mono font-semibold text-ink">{l.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mail.status === 'new' ? (
        <button type="button" disabled={matchedLines.length === 0}
          onClick={() => createDepotOrder(mail.id, matchedLines.map((l) => ({ sku: l.sku!, qty: l.qty })))}
          className="mt-4 w-full rounded-xl bg-depot px-4 py-2.5 text-sm font-semibold text-depot-ink shadow-neu-sm transition-all hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-depot disabled:cursor-not-allowed disabled:opacity-40">
          {matchedLines.length === 0 ? t('depot.noLinesCta') : t('depot.createOrder')}
        </button>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-depot">
          <PackageCheck className="h-4 w-4" />{t('depot.created')}
        </p>
      )}
    </div>
  );
}

export default function DepotPage() {
  const { t } = useI18n();
  const { depotMails, stock, depotOrders } = useSuite();
  const [selected, setSelected] = useState<string>(depotMails[0].id);
  const mail = depotMails.find((m) => m.id === selected) ?? depotMails[0];

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{t('depot.title')}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t('depot.sub')}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div className="space-y-3">
              {depotMails.map((m) => (
                <button key={m.id} type="button" onClick={() => setSelected(m.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl bg-neu-raised p-4 text-left shadow-neu-sm transition-all focus:outline-none focus:ring-2 focus:ring-depot',
                    m.id === selected && 'ring-2 ring-depot'
                  )}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neu-inset text-ink-soft shadow-neu-in">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold text-ink">{m.from}</span>
                    <span className="mt-0.5 block truncate text-xs text-ink-soft">{m.subject}</span>
                  </span>
                  {m.status === 'ordered' && <PackageCheck className="h-4 w-4 shrink-0 text-depot" />}
                </button>
              ))}
            </div>

            {depotOrders.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">{t('depot.order')}</h2>
                <div className="space-y-2">
                  {depotOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl bg-neu-raised px-4 py-3 shadow-neu-sm">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-subtle">{o.id}</p>
                        <p className="truncate text-sm font-medium text-ink">{o.from}</p>
                      </div>
                      {o.status === 'picking' ? (
                        <button type="button" onClick={() => shipDepotOrder(o.id)}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-depot px-3 py-1.5 text-xs font-semibold text-depot-ink shadow-neu-sm hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-depot">
                          <Truck className="h-3.5 w-3.5" />{t(`depot.status.${o.status}` as TranslationKey)}
                        </button>
                      ) : (
                        <span className="shrink-0 text-xs font-semibold text-depot">{t(`depot.status.${o.status}` as TranslationKey)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <MailDetail key={mail.id} mail={mail} />
            <div className="rounded-2xl bg-neu-raised p-5 shadow-neu">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">{t('depot.stock')}</h2>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {stock.map((s) => {
                    const low = s.qty <= s.reorderAt;
                    return (
                      <tr key={s.sku} className="border-t border-rule first:border-t-0">
                        <td className="py-1.5 font-mono text-xs text-ink-soft">{s.sku}</td>
                        <td className="py-1.5 text-ink">{s.name}</td>
                        <td className={cn('py-1.5 text-right font-mono text-xs font-semibold', low ? 'text-sev-warn' : 'text-ink')}>
                          {s.qty}{low && <span className="ml-1 font-sans">· {t('depot.low')}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
