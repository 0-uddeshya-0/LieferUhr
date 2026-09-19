import { Download, CircleCheck, CircleAlert, OctagonAlert } from 'lucide-react';
import { useI18n } from '../i18n';
import { useSuite } from '../demo/store';
import { cn } from '../lib/cn';
import type { TranslationKey } from '../i18n/translations';

const DAY_LIMIT = 540;   // 9h driving time
const WEEK_LIMIT = 3360; // 56h weekly

function bar(pct: number) {
  return pct >= 90 ? 'bg-sev-bad' : pct >= 75 ? 'bg-sev-warn' : 'bg-comply';
}

function daysTone(days: number) {
  if (days < 0) return { icon: OctagonAlert, cls: 'text-sev-bad', label: 'comply.overdue' as const };
  if (days <= 30) return { icon: CircleAlert, cls: 'text-sev-warn', label: null };
  return { icon: CircleCheck, cls: 'text-comply', label: null };
}

export default function ComplyPage() {
  const { t } = useI18n();
  const { drivers, complyDocs } = useSuite();

  // The demo export produces a real file from the data on screen — the
  // production version packages the same registers as PDF.
  const exportPack = () => {
    const lines = [
      'KONTROLL-PAKET — Betriebsamt PrüfAmt (Demo-Daten)',
      `Stand: ${new Date().toLocaleString('de-DE')}`,
      '',
      'FAHRER-UHREN',
      ...drivers.map(
        (d) =>
          `- ${d.name}: heute ${Math.floor(d.driveTodayMin / 60)}h ${String(d.driveTodayMin % 60).padStart(2, '0')}m / 9h · Woche ${Math.round(d.weekMin / 60)}h / 56h · Pause fällig in ${d.breakDueMin}m`,
      ),
      '',
      'DOKUMENTEN-REGISTER',
      ...complyDocs
        .slice()
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .map(
          (d) =>
            `- ${t(`comply.doc.${d.kind}` as TranslationKey)} (${d.holder}): ${d.daysLeft < 0 ? 'überfällig' : `${d.daysLeft} Tage`}`,
        ),
      '',
      'CHECKLISTE',
      ...([1, 2, 3, 4] as const).map((n) => `[x] ${t(`comply.audit.item${n}` as TranslationKey)}`),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kontroll-paket.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">{t('comply.title')}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t('comply.sub')}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">{t('comply.drivers')}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {drivers.map((d) => {
                  const dayPct = Math.round((d.driveTodayMin / DAY_LIMIT) * 100);
                  const weekPct = Math.round((d.weekMin / WEEK_LIMIT) * 100);
                  const hh = Math.floor(d.driveTodayMin / 60);
                  const mm = d.driveTodayMin % 60;
                  return (
                    <div key={d.id} className="rounded-2xl bg-neu-raised p-4 shadow-neu-sm">
                      <p className="font-display text-sm font-semibold text-ink">{d.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-subtle">
                        {t('comply.driveToday')}: {hh}h {String(mm).padStart(2, '0')}m / 9h
                      </p>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-neu-inset shadow-neu-in">
                        <div className={cn('h-full rounded-full transition-all', bar(dayPct))} style={{ width: `${dayPct}%` }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-subtle">{t('comply.weekUsed')} {Math.round(d.weekMin / 60)}h / 56h</span>
                        <span className={cn('font-mono font-semibold', d.breakDueMin <= 30 ? 'text-sev-bad' : 'text-ink-soft')}>
                          {t('comply.breakDue')} {d.breakDueMin}m
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neu-inset shadow-neu-in">
                        <div className={cn('h-full rounded-full transition-all', bar(weekPct))} style={{ width: `${weekPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">{t('comply.docs')}</h2>
              <div className="overflow-hidden rounded-2xl bg-neu-raised shadow-neu-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {complyDocs
                      .slice()
                      .sort((a, b) => a.daysLeft - b.daysLeft)
                      .map((d, i) => {
                        const tone = daysTone(d.daysLeft);
                        const Icon = tone.icon;
                        return (
                          <tr key={i} className={cn(i > 0 && 'border-t border-rule')}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-ink">{t(`comply.doc.${d.kind}` as TranslationKey)}</p>
                              <p className="text-xs text-subtle">{d.holder}</p>
                            </td>
                            <td className={cn('flex items-center justify-end gap-2 px-4 py-3 font-mono text-xs font-semibold', tone.cls)}>
                              <Icon className="h-4 w-4" />
                              {d.daysLeft < 0 ? t('comply.overdue') : t('comply.daysLeft', { days: d.daysLeft })}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl bg-neu-raised p-5 shadow-neu">
              <h2 className="font-display text-lg font-bold tracking-tight text-ink">{t('comply.audit')}</h2>
              <p className="mt-1 text-xs text-ink-soft">{t('comply.auditSub')}</p>
              <ul className="mt-4 space-y-2.5">
                {([1, 2, 3, 4] as const).map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-sm text-ink">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-comply" />
                    {t(`comply.audit.item${n}` as TranslationKey)}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={exportPack}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-comply px-4 py-2.5 text-sm font-semibold text-comply-ink shadow-neu-sm transition-all hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-comply"
              >
                <Download className="h-4 w-4" />
                {t('comply.audit.export')}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
