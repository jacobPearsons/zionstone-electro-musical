'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Preloader.module.css';

const EXIT_MS = 300;

// Layout effects do not exist on the server and warn there; effects do not run
// before paint on the client, which would let the entry animation flash the
// pre-reduced-motion frame.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PreloaderProps {
  /**
   * Floor for how long the overlay stays fully opaque, in ms. A preloader with
   * no floor flashes for a frame on a warm cache and reads as a glitch.
   * @default 450
   */
  minimumDuration?: number;
  /** Fired once, after the overlay has finished leaving and been unmounted. */
  onComplete?: () => void;
  /** Visually-hidden text announced to assistive technology. */
  label?: string;
}

export function Preloader({
  minimumDuration = 450,
  onComplete,
  label = 'Loading Zionstone Electro Musical',
}: PreloaderProps) {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [removed, setRemoved] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  // Held in a ref so an inline arrow from the parent cannot re-arm the exit
  // timer on every render and stall the dismissal.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const hold = window.setTimeout(
      () => setExiting(true),
      Math.max(0, minimumDuration),
    );
    return () => window.clearTimeout(hold);
  }, [minimumDuration]);

  useEffect(() => {
    if (!exiting) return;
    const fade = window.setTimeout(() => {
      setRemoved(true);
      onCompleteRef.current?.();
    }, EXIT_MS);
    return () => window.clearTimeout(fade);
  }, [exiting]);

  if (removed) return null;

  // Render the static tree until mounted: server and first client render must
  // match, and only then do the CSS entry keyframes take over. Reduced-motion
  // users keep that static tree for the whole life of the overlay, because the
  // global `prefers-reduced-motion` rule kills the keyframes.
  const animated = mounted;
  const holdMs = Math.max(0, minimumDuration);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ease-out ${
        exiting ? 'opacity-0' : ''
      }`}
    >
      <span className="sr-only">{label}</span>
      <div
        className={`flex flex-col items-center gap-8 ${animated ? styles.enter : ''}`}
      >
        <div className={`${styles.popBadge}`}>
          <Image
            src="/brand/logo.png"
            alt=""
            width={359}
            height={453}
            priority
            // `w-auto` keeps the portrait logo's intrinsic aspect while the
            // fixed heights size it across breakpoints; explicit dims above
            // reserve the box so the badge pop never shifts the bar.
            className="h-20 w-auto sm:h-24"
          />
        </div>
        <div
          className={`relative h-1.5 w-44 overflow-hidden rounded-pill bg-muted sm:w-64 ${styles.riseWord}`}
          style={{ animationDelay: '150ms' }}
        >
          <div
            className={`absolute inset-y-0 left-0 w-full bg-primary ${styles.fill}`}
            style={
              animated
                ? { animationDuration: `${holdMs}ms`, animationDelay: '150ms' }
                : undefined
            }
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 ${styles.shimmer}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}