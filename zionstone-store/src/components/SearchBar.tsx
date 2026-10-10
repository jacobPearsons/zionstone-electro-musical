'use client';

import { Search, X, Mic } from 'lucide-react';
import { useState, useRef, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const listboxId = useId();

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
      setActiveIndex(-1);
    } else {
      setIsOpen(false);
      setResults([]);
      setActiveIndex(-1);
    }
  }, [query]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/products/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      handleSelect(results[activeIndex].slug);
      return;
    }
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative hidden md:block w-full max-w-md">
      <form onSubmit={handleSubmit} role="search" aria-label="Product search">
        <div className="relative">
          {/* WCAG 1.3.1 / 4.1.2: a visible placeholder is not a label, so the
              input carries an off-screen one, plus the combobox wiring the
              listbox below needs to be announced as an autocomplete. */}
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id="site-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search instruments, gear..."
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          {query ? (
            <button 
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              aria-label="Voice search"
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
      
      {isOpen && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-auto rounded-2xl border border-border bg-popover text-popover-foreground"
        >
          {results.map((result, index) => (
            <li
              key={result.slug}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onClick={() => handleSelect(result.slug)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(e) => e.preventDefault()}
              className="flex cursor-pointer items-center justify-between border-b border-border px-4 py-3 text-left text-sm transition-colors duration-150 last:border-b-0 hover:bg-primary/10 aria-selected:bg-primary/10"
            >
              <span className="font-medium">{result.name}</span>
              <span className="text-xs text-muted-foreground">{result.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
