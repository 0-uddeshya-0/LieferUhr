import { Badge } from './ui/Badge';
import { useI18n } from '../i18n';
import type { LoadStatus } from '../types';

const VARIANT: Record<LoadStatus, 'default' | 'blue' | 'orange' | 'green' | 'red'> = {
  NEW: 'default',
  DISPATCHED: 'blue',
  PICKED_UP: 'orange',
  IN_TRANSIT: 'orange',
  DELIVERED: 'green',
  INVOICED: 'green',
  CANCELLED: 'red',
};

export function LoadStatusBadge({ status }: { status: LoadStatus }) {
  const { statusLabel } = useI18n();
  return <Badge variant={VARIANT[status]}>{statusLabel(status)}</Badge>;
}
