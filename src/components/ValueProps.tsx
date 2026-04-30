import { Truck, Shield, Headphones, RotateCcw } from 'lucide-react';

const valueProps = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  },
  {
    icon: Shield,
    title: 'Verified Authentic',
    description: '100% genuine gear',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Music tech specialists',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day hassle-free',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
];

export function ValueProps() {
  return (
    <section className="py-8 bg-yellow-50 dark:bg-yellow-950 border-y">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${prop.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">{prop.title}</p>
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