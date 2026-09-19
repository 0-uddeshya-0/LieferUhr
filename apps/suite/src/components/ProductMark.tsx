import { CalendarClock, Boxes, Navigation, Wrench, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/cn';

export type ProductId = 'frachtamt' | 'pruefamt' | 'einsatzamt' | 'postamt' | 'suite';

const ICONS: Record<ProductId, typeof Navigation> = {
  suite: LayoutGrid,
  frachtamt: Navigation,
  pruefamt: CalendarClock,
  einsatzamt: Wrench,
  postamt: Boxes,
};

// Tone classes resolve against the product accent tokens in index.css.
const TONES: Record<ProductId, string> = {
  suite: 'bg-uhr text-uhr-ink',
  frachtamt: 'bg-dispatch text-dispatch-ink',
  pruefamt: 'bg-comply text-comply-ink',
  einsatzamt: 'bg-hvac text-hvac-ink',
  postamt: 'bg-depot text-depot-ink',
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

// Core tools first; EinsatzAmt stays reachable but sits outside the two core worlds.
export const PRODUCT_IDS: ProductId[] = ['frachtamt', 'pruefamt', 'postamt'];
export const EXPERIMENT_IDS: ProductId[] = ['einsatzamt'];
