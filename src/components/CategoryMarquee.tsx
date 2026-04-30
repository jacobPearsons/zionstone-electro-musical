import Link from 'next/link';
import { Guitar, Music, Mic2, Drum, Headphones, Speaker, Cable, Wand2 } from 'lucide-react';

const categories = [
  { name: 'Guitars', icon: Guitar, href: '/products?category=guitars-basses', count: 245 },
  { name: 'Keyboards & Synths', icon: Music, href: '/products?category=keyboards-synths', count: 189 },
  { name: 'Drums & Percussion', icon: Drum, href: '/products?category=drums-percussion', count: 156 },
  { name: 'Studio Monitors', icon: Speaker, href: '/products?category=studio-monitors', count: 98 },
  { name: 'Audio Interfaces', icon: Mic2, href: '/products?category=audio-interfaces', count: 124 },
  { name: 'Microphones', icon: Mic2, href: '/products?category=microphones', count: 187 },
  { name: 'PA Systems', icon: Speaker, href: '/products?category=pa-systems', count: 76 },
  { name: 'Headphones', icon: Headphones, href: '/products?category=headphones', count: 143 },
  { name: 'Mixers', icon: Drum, href: '/products?category=mixers', count: 92 },
  { name: 'Amplifiers', icon: Speaker, href: '/products?category=amplifiers', count: 134 },
  { name: 'Effects Pedals', icon: Wand2, href: '/products?category=effects-pedals', count: 267 },
  { name: 'Cables & Accs', icon: Cable, href: '/products?category=cables-accessories', count: 312 },
];

export function CategoryMarquee() {
  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900 border-y overflow-hidden">
      <div className="container mx-auto px-4 mb-4">
        <h2 className="text-lg font-semibold text-center">Shop by Category</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 animate-marquee">
          {[...categories, ...categories].map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={`${category.name}-${index}`}
                href={category.href}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-full hover:border-purple-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
                <span className="text-xs text-muted-foreground">({category.count})</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}