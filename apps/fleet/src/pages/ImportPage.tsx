import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { fleetApi } from '../api/fleet';
import { useI18n } from '../i18n';
import { Button } from '../components/ui/Button';

export function ImportPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ imported: number; errors: Array<{ row: number; message: string }> } | null>(null);

  const importMutation = useMutation({
    mutationFn: (file: File) => fleetApi.importLoads(file),
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-display font-bold">{t('import.title')}</h1>
      <div className="neu-card">
        <p className="text-sm text-neu-muted">{t('import.hint')}</p>
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
        <Button onClick={() => fileRef.current?.click()} disabled={importMutation.isPending}>
          <Upload className="w-4 h-4 mr-2" />
          {t('import.select')}
        </Button>
        {result && (
          <div className="text-sm space-y-1">
            <p className="text-risk-green font-medium">{t('import.result', { count: result.imported })}</p>
            {result.errors.length > 0 && (
              <div className="text-risk-red">
                <p className="font-medium">{t('import.errors')}:</p>
                <ul className="list-disc pl-5">
                  {result.errors.map((e) => (
                    <li key={e.row}>{e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
