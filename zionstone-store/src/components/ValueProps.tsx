import { Truck, Shield, Headphones, RotateCcw } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';

/**
 * Gold is spent once per strip. `DESIGN.md` §1 sanctions exactly one shipping
 * badge as a gold element, so the shipping icon keeps the accent and the other
 * three go neutral; four gold circles read as a pattern, which cheapens it.
 * Neutral circles sit on `bg-muted`, so they take `bg-background` to stay visible.
 */
const valueProps = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: `On orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Shield,
    title: 'Verified Authentic',
    description: '100% genuine gear',
    color: 'bg-background text-foreground',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Music tech specialists',
    color: 'bg-background text-foreground',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day hassle-free',
    color: 'bg-background text-foreground',
  },
];

export function ValueProps() {
  return (
    <section className="py-8 bg-muted border-y">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${prop.color}`}>
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold tracking-tight">{prop.title}</p>
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}