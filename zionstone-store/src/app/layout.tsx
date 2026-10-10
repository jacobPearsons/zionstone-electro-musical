import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Preloader } from "@/components/Preloader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { RecentlyViewedProvider } from "@/lib/recently-viewed-context";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

/**
 * Inter is self-hosted rather than fetched from Google at build time.
 *
 * `next/font/google` downloads the family during `next build`, which made the
 * build depend on outbound network access and failed outright in sandboxed or
 * offline CI. Local also drops the third-party request on first paint and
 * removes a render-blocking round trip to fonts.gstatic.com.
 *
 * One variable file covers the whole 100-900 axis, so the `font-medium`,
 * `font-semibold` and `font-bold` utilities all resolve from a single 48 kB
 * asset. The CSS variable name is unchanged, so `tailwind.config.ts` needs no
 * edit.
 */
const inter = localFont({
  src: [{ path: "../../public/fonts/Inter-Variable-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

/**
 * Blocking pre-paint theme script. Kept verbatim: it reads the `theme` key
 * (values `'dark'` / `'light'`) and falls back to the system preference, so the
 * canvas is correct before first paint. `src/components/header.tsx` reads and
 * writes the same key and must not change its name or value format.
 */
const themeScript = `(function(){try{if(typeof window==='undefined'||typeof document==='undefined')return;var stored=window.localStorage.getItem('theme');var dark=stored?stored==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Zionstone Electro Musical";
const SITE_TITLE = "Zionstone Electro Musical | Premium Musical Instruments & Studio Equipment";
const SITE_DESCRIPTION =
  "Your trusted destination for musical instruments and professional audio equipment. Shop guitars, drums, keyboards, studio gear, and more.";
/**
 * TODO: a dedicated 1200x630 social card. `public/brand/footer.png` is a
 * 1728x707 wordmark banner — the closest brand asset that exists, but link
 * previews will letterbox it and the logo will be small.
 */
const SOCIAL_IMAGE = {
  url: "/brand/footer.png",
  width: 1728,
  height: 707,
  alt: "Zionstone Electro Musical — guitars, keys, drums and studio gear",
};

export const metadata: Metadata = {
  // Resolves the relative social paths below. Falls back to localhost so the
  // build never warns; set NEXT_PUBLIC_SITE_URL for real deployments.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: ["musical instruments", "audio equipment", "guitars", "drums", "studio equipment", "electronics"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className={`${inter.className} ${inter.variable}`}>
          <Preloader />
          <ScrollToTop />
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <div className="flex min-h-screen flex-col">
                  {/* WCAG 2.4.1 (Bypass Blocks): the first focusable element on
                      the page, revealed only on keyboard focus. Wired to the
                      `<main id="main-content">` below so a keyboard or
                      screen-reader user can jump past the announcement bar,
                      header, and navigation. */}
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Skip to main content
                  </a>
                  <AnnouncementBar
                    message={`Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
                    link="/products"
                    linkText="Learn More"
                  />
                  <Header />
                  <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                    {children}
                  </main>
                  <Footer />
                </div>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
