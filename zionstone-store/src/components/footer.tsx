import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Instagram, MessageCircle, Phone, Twitter } from "lucide-react";
import { Newsletter } from "./Newsletter";
import { OWNER_EMAIL, OWNER_PHONES, ownerWhatsAppHref } from "@/lib/contact";

const INSTAGRAM_HANDLE = "Zionstoneelectro_musicals";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

const linkClass =
  "text-muted-foreground transition-colors duration-150 hover:text-primary-strong/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const columnLabel = "mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground";

const socialClass =
  "flex h-10 w-10 items-center justify-center rounded-pill border border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const socials = [
  { label: "Instagram", href: INSTAGRAM_URL, icon: Instagram },
  { label: "Twitter / X", href: "#", icon: Twitter },
  {
    label: "WhatsApp",
    href: ownerWhatsAppHref(OWNER_PHONES[0], "Hi Zionstone, I'd like to ask about your products and services."),
    icon: MessageCircle,
  },
  { label: "Call", href: `tel:${OWNER_PHONES[1].tel}`, icon: Phone },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter */}
        <div className="mb-12">
          <Newsletter />
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <p className="text-lg font-semibold tracking-tight">Zionstone Electro Musical</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Premium musical instruments, professional sound installation, and acoustic
              solutions for creators and venues.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={socialClass}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
            <p className="mt-4 text-sm">
              <a href={`mailto:${OWNER_EMAIL}`} className={linkClass}>
                {OWNER_EMAIL}
              </a>
            </p>
          </div>

          {/* Shop */}
          <nav aria-label="Shop">
            <h2 className={columnLabel}>Shop</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories" className={linkClass}>
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/products" className={linkClass}>
                  Instruments
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className={linkClass}>
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h2 className={columnLabel}>Company</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className={linkClass}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#services" className={linkClass}>
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Get in Touch */}
          <div>
            <h2 className={columnLabel}>Get in Touch</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={ownerWhatsAppHref(OWNER_PHONES[0], "Hi Zionstone, I'd like to ask about a product.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  WhatsApp {OWNER_PHONES[0].label}
                </a>
              </li>
              <li>
                <a href={`tel:${OWNER_PHONES[1].tel}`} className={linkClass}>
                  Call {OWNER_PHONES[1].label}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  @{INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>

          {/* Your Account. /dashboard sits behind Clerk's protect() middleware, so
              it is only linked for a signed-in visitor — otherwise the click
              lands on an auth 404 rather than a sign-in prompt. */}
          <nav aria-label="Your account">
            <h2 className={columnLabel}>Your Account</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cart" className={linkClass}>
                  Your Cart
                </Link>
              </li>
              <SignedIn>
                <li>
                  <Link href="/dashboard" className={linkClass}>
                    Order History
                  </Link>
                </li>
              </SignedIn>
              <SignedOut>
                <li>
                  <Link href="/sign-in" className={linkClass}>
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className={linkClass}>
                    Create Account
                  </Link>
                </li>
              </SignedOut>
            </ul>
          </nav>
        </div>

        {/* Brand Footer Image */}
        <div className="mt-12 relative h-32 md:h-48 w-full">
          <Image
            src="/brand/footer.png"
            alt="ElectroMusical Store"
            fill
            className="object-contain"
          />
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Zionstone Electro Musical. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Secure payments powered by Paystack
          </p>
        </div>
      </div>
    </footer>
  );
}
