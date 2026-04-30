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
            className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {query ? (
            <button 
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              aria-label="Clear"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              aria-label="Voice search"
            >
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </form>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {results.map((result) => (
            <button
              key={result.slug}
              onClick={() => handleSelect(result.slug)}
              className="w-full px-4 py-3 text-left hover:bg-yellow-50 flex items-center justify-between border-b last:border-b-0"
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