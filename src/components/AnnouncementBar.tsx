'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AnnouncementBarProps {
  message: string;
  link?: string;
  linkText?: string;
}

export function AnnouncementBar({ message, link, linkText = 'Shop Now' }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('announcement-dismissed');
    if (stored) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('announcement-dismissed', 'true');
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`bg-slate-900 text-white py-2 transition-all duration-300 ${
        isAnimating ? 'opacity-0 -translate-y-full' : 'opacity-100'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-sm relative">
          <p>{message}</p>
          {link && (
            <a href={link} className="font-medium underline hover:text-yellow-300">
              {linkText}
            </a>
          )}
          <button
            onClick={handleDismiss}
            className="absolute right-0 md:right-4 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}