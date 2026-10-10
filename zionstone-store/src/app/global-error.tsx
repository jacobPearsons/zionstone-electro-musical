'use client';

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// The root layout is what this boundary replaces, so it has to bring the token
// layer with it. App Router allows a global stylesheet in any file under `app/`.
import "./globals.css";

// Verbatim from `src/app/layout.tsx:17`. Without the root layout there is no
// prepaint script, so the fallback would otherwise always render light.
const themeScript = `(function(){try{if(typeof window==='undefined'||typeof document==='undefined')return;var stored=window.localStorage.getItem('theme');var dark=stored?stored==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`;

/**
 * Last-resort boundary for failures in the ROOT layout — the font, the theme
 * script, `ClerkProvider` and the three client providers all live there, and
 * `error.tsx` is a child of that layout, so it cannot catch a layout throwing.
 * Without this file those failures land on Next's unstyled built-in error page:
 * no tokens, no dark mode, no way back into the store.
 *
 * It replaces `<html>`/`<body>`, so it renders both. `import "./globals.css"` is
 * load-bearing: without it this fallback has no tokens, because the stylesheet is
 * otherwise only pulled in by the root layout it is standing in for.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground">
        <div role="alert" className="mx-auto max-w-md px-4 py-24 text-center">
          <TriangleAlert className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
          <p className="mb-3 font-display text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Zionstone
          </p>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">
            The store did not start
          </h1>
          <p className="mb-8 text-muted-foreground">
            Something failed before the page could render. Trying again usually
            clears it.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={() => reset()}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
