'use client';

import { Search, X, Mic } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { products } from '@/data/products';

interface SearchResult {
  name: string;
  category: string;
  slug: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length > 1) {
      const filtered = products
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          category: p.brand,
          slug: p.slug,
        }));
      setResults(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
      setResults([]);
    }
  }, [query]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/products/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  return (
    <div className="relative hidden md:block w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search instruments, gear..."
            className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {query ? (
            <button 
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              aria-label="Voice search"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-auto rounded-2xl border border-border bg-popover text-popover-foreground">
          {results.map((result) => (
            <button
              key={result.slug}
              onClick={() => handleSelect(result.slug)}
              className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-sm transition-colors duration-150 last:border-b-0 hover:bg-primary/10"
            >
              <span className="font-medium">{result.name}</span>
              <span className="text-xs text-muted-foreground">{result.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}