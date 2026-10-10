'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EXIT_MS = 420;
const STACK = 'flex flex-col items-center gap-6';
const RULE = 'relative h-px w-40 overflow-hidden bg-border sm:w-56';
const FILL = 'absolute inset-y-0 left-0 w-full origin-left bg-primary';

// Layout effects do not exist on the server and warn there; effects do not run
// before paint on the client, which would flash the pre-reduced-motion frame.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PreloaderProps {
  /**
   * Floor for how long the overlay stays fully opaque, in ms. A preloader with
   * no floor flashes for a frame on a warm cache and reads as a glitch.
   * @default 600
   */
  minimumDuration?: number;
  /** Fired once, after the overlay has finished leaving and been unmounted. */
  onComplete?: () => void;
  /** Visually-hidden text announced to assistive technology. */
  label?: string;
}

export function Preloader({
  minimumDuration = 600,
  onComplete,
  label = 'Loading Zionstone Electro Musical',
}: PreloaderProps) {
  const reduceMotion = useReducedMotion();
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

  // Render the static tree until mounted: server and first client render must
  // match, and `useReducedMotion()` only resolves on the client. Reduced-motion
  // users then keep the static tree for the whole life of the overlay.
  const animated = mounted && !reduceMotion;

  useEffect(() => {
    if (!exiting) return;
    if (!animated) {
      setRemoved(true);
      onCompleteRef.current?.();
      return;
    }
    const fade = window.setTimeout(() => {
      setRemoved(true);
      onCompleteRef.current?.();
    }, EXIT_MS);
    return () => window.clearTimeout(fade);
  }, [exiting, animated]);

  if (removed) return null;

  const progress = animated ? (
    <motion.div
      className={FILL}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: Math.max(0, minimumDuration) / 1000, ease: [0.16, 1, 0.3, 1] }}
    />
  ) : (
    <div className={FILL} />
  );

  const content = (
    <>
      <p className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
        Zionstone
      </p>
      <p className="font-display text-xs font-medium uppercase tracking-wider text-primary-strong">
        Electro Musical
      </p>
      <div className={RULE}>{progress}</div>
    </>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <span className="sr-only">{label}</span>
      {animated ? (
        <motion.div
          className={STACK}
          initial={false}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: EXIT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        >
          {content}
        </motion.div>
      ) : (
        <div className={STACK}>{content}</div>
      )}
    </div>
  );
}
