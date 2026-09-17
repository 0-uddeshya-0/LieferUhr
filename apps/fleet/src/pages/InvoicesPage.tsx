import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { fleetApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function InvoicesPage() {
  const { t, formatDate, formatCurrency } = useI18n();
  const queryClient = useQueryClient();
  const [billing, setBilling] = useState<Record<string, string> | null>(null);
  const [billingSaved, setBillingSaved] = useState(false);

  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: fleetApi.invoices });
  const { data: billingData } = useQuery({ queryKey: ['billing'], queryFn: fleetApi.billingSettings });

  const paidMutation = useMutation({
    mutationFn: fleetApi.markPaid,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const saveBilling = useMutation({
    mutationFn: (body: Record<string, string>) => fleetApi.saveBillingSettings(body),
    onSuccess: () => {
      setBillingSaved(true);
      setBilling(null);
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      setTimeout(() => setBillingSaved(false), 2000);
    },
  });

  const b = billing ?? {
    street: billingData?.street ?? '',
    zip: billingData?.zip ?? '',
    city: billingData?.city ?? '',
    taxId: billingData?.taxId ?? '',
    invoicePrefix: billingData?.invoicePrefix ?? 'RE-',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">{t('invoices.title')}</h1>

      <div className="neu-card">
        <h2 className="text-sm font-medium text-neu-muted">{t('invoices.billing.title')}</h2>
        <p className="text-xs text-neu-muted/70 mb-4">{t('invoices.billing.hint')}</p>
        <div className="grid md:grid-cols-3 gap-4">
          <Input label={t('invoices.billing.street')} value={b.street} onChange={(e) => setBilling({ ...b, street: e.target.value })} />
          <Input label={t('invoices.billing.zip')} value={b.zip} onChange={(e) => setBilling({ ...b, zip: e.target.value })} />
          <Input label={t('invoices.billing.city')} value={b.city} onChange={(e) => setBilling({ ...b, city: e.target.value })} />
          <Input label={t('invoices.billing.taxId')} value={b.taxId} onChange={(e) => setBilling({ ...b, taxId: e.target.value })} />
          <Input label={t('invoices.billing.prefix')} value={b.invoicePrefix} onChange={(e) => setBilling({ ...b, invoicePrefix: e.target.value })} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" disabled={saveBilling.isPending} onClick={() => saveBilling.mutate(b)}>
            {t('common.save')}
          </Button>
          {billingSaved && <span className="text-sm text-risk-green">{t('invoices.billing.saved')}</span>}
        </div>
      </div>

      <div className="neu-card">
        <table className="w-full text-sm">
          <thead className="bg-neu-sunken/60 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('invoices.number')}</th>
              <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('invoices.buyer')}</th>
              <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('invoices.load')}</th>
              <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('invoices.issued')}</th>
              <th className="text-left px-4 py-3 font-medium text-neu-muted hidden md:table-cell">{t('invoices.due')}</th>
              <th className="text-right px-4 py-3 font-medium text-neu-muted">{t('invoices.gross')}</th>
              <th className="text-left px-4 py-3 font-medium text-neu-muted">{t('invoices.status')}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-medium">
                  <a
                    href={fleetApi.invoicePdfUrl(inv.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 hover:underline inline-flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    {inv.invoiceNumber}
                  </a>
                </td>
                <td className="px-4 py-3 text-neu-muted">{inv.buyerName}</td>
                <td className="px-4 py-3 text-neu-muted">{inv.load?.loadNumber ?? '—'}</td>
                <td className="px-4 py-3 text-neu-muted">{formatDate(inv.issuedAt)}</td>
                <td className="px-4 py-3 text-neu-muted hidden md:table-cell">
                  {inv.dueAt ? formatDate(inv.dueAt) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.grossCents)}</td>
                <td className="px-4 py-3">
                  <Badge variant={inv.status === 'PAID' ? 'green' : 'yellow'}>
                    {inv.status === 'PAID' ? t('invoices.paid') : inv.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {inv.status === 'ISSUED' && (
                    <button
                      type="button"
                      onClick={() => paidMutation.mutate(inv.id)}
                      className="text-xs text-brand-700 hover:underline"
                    >
                      {t('invoices.markPaid')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-neu-muted">{t('invoices.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
