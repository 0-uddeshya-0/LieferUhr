import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Trash2 } from 'lucide-react';
import { fleetApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function CustomersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', contactName: '', contactEmail: '', address: '' });
  const [importResult, setImportResult] = useState<string | null>(null);

  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: fleetApi.customers });

  const addMutation = useMutation({
    mutationFn: () =>
      fleetApi.createCustomer({
        name: form.name,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        address: form.address || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowForm(false);
      setForm({ name: '', contactName: '', contactEmail: '', address: '' });
    },
  });

  const delMutation = useMutation({
    mutationFn: fleetApi.deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => fleetApi.importCustomers(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setImportResult(
        t('customers.imported', { count: res.imported }) +
          (res.errors.length ? ` · ${t('import.errors')}: ${res.errors.map((e) => e.row).join(', ')}` : '')
      );
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t('customers.title')}</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={importMutation.isPending}>
            <Upload className="w-4 h-4 mr-1" />
            {t('customers.import')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importMutation.mutate(f);
              e.target.value = '';
            }}
          />
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            {t('customers.add')}
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-400">{t('customers.importHint')}</p>
      {importResult && <p className="text-sm text-risk-green">{importResult}</p>}

      {showForm && (
        <div className="bg-white rounded-xl border p-6 grid md:grid-cols-2 gap-4">
          <Input label={t('common.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label={t('common.contactName')} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          <Input label={t('common.email')} type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          <Input label={t('common.address')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="md:col-span-2 flex gap-3">
            <Button size="sm" disabled={!form.name || addMutation.isPending} onClick={() => addMutation.mutate()}>
              {t('common.save')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t('common.name')}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t('common.email')}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">{t('common.address')}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">{t('customers.loads')}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.contactEmail ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.address ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c._count?.loads ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => delMutation.mutate(c.id)} className="text-gray-400 hover:text-risk-red">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">{t('customers.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
