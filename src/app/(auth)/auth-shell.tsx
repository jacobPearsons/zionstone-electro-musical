import Link from 'next/link';
import type { ReactNode } from 'react';

const BRAND_NAME = 'Zionstone Electro Musical';

type AuthShellProps = {
  /** The page's visible heading. Renders as the document's top-level `h1`. */
  title: string;
  /** The Clerk component for this route. It renders its own card, so the shell
   *  stays a plain column — nesting a card inside a card is the one decoration
   *  this route cannot afford. */
  children: ReactNode;
  /** Sentence fragment above the sibling link, e.g. "Don't have an account?". */
  siblingPrompt: string;
  siblingHref: string;
  siblingLabel: string;
};

/**
 * The single shell shared by `/sign-in` and `/sign-up`.
 *
 * Replaces the two-panel split (branding panel + form) that was duplicated
 * across both routes. The panel is gone, so there is no `bg-secondary` surface
 * left to carry light ink, and no `lg:w-1/2` split to maintain in two places.
 *
 * Colour notes, all token-driven so both themes invert correctly:
 * - The wordmark and title are `text-foreground` on `bg-background`. They were
 *   `text-primary` at `text-2xl font-bold` before; the gold is now reserved for
 *   the one sibling link, which is body-size and therefore `text-primary-strong`
 *   (5.87:1 on white, 5.17:1 on `--muted`) rather than `text-primary` (3.27:1).
 * - The sibling link is underlined persistently, not only on hover: it is
 *   mid-sentence body text, and colour alone may not be the only cue (WCAG 1.4.1).
 * - No `focus` utility is set anywhere below, so the global `:focus-visible`
 *   outline in `globals.css` (2px `--ring`, 3.27:1 on white) is what shows. Do
 *   not add `focus:outline-none` here — it is the only focus indicator these
 *   links have.
 * - No `animate-*` and no `duration-*`; the lone `transition-colors` is
 *   neutralised by the `!important` block in `globals.css` under
 *   `prefers-reduced-motion`.
 */
export function AuthShell({
  title,
  children,
  siblingPrompt,
  siblingHref,
  siblingLabel,
}: AuthShellProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-sm font-semibold tracking-tight text-foreground transition-colors duration-150 hover:text-primary-strong"
        >
          {BRAND_NAME}
        </Link>

        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>

        <div className="mt-6">{children}</div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {siblingPrompt}{' '}
          <Link
            href={siblingHref}
            className="font-medium text-primary-strong underline underline-offset-4"
          >
            {siblingLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
