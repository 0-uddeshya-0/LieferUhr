import { CalendarClock, Boxes, Navigation, Wrench, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/cn';

export type ProductId = 'dispatch' | 'comply' | 'hvac' | 'depot' | 'suite';

const ICONS: Record<ProductId, typeof Navigation> = {
  suite: LayoutGrid,
  dispatch: Navigation,
  comply: CalendarClock,
  hvac: Wrench,
  depot: Boxes,
};

// Tone classes resolve against the product accent tokens in index.css.
const TONES: Record<ProductId, string> = {
  suite: 'bg-uhr text-uhr-ink',
  dispatch: 'bg-dispatch text-dispatch-ink',
  comply: 'bg-comply text-comply-ink',
  hvac: 'bg-hvac text-hvac-ink',
  depot: 'bg-depot text-depot-ink',
};

export function ProductMark({ product, className }: { product: ProductId; className?: string }) {
  const Icon = ICONS[product];
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-xl shadow-neu-sm', TONES[product], className ?? 'h-8 w-8')}
      aria-hidden
    >
      <Icon className="h-[60%] w-[60%]" strokeWidth={2.2} />
    </span>
  );
}

export const PRODUCT_IDS: ProductId[] = ['dispatch', 'comply', 'hvac', 'depot'];
