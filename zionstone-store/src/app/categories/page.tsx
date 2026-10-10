import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { OWNER_PHONES, ownerWhatsAppHref } from "@/lib/contact";
import { FadeIn } from "@/components/ui/animated";

export const metadata = {
  title: "All Categories",
  description:
    "Explore our full range of musical instruments, gear, and accessories at Zionstone Electro Musical.",
};

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <FadeIn>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">All Categories</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Explore our full range of musical instruments, gear, and accessories.
        </p>
      </FadeIn>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
        {CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          return (
            <FadeIn key={category.slug} delay={index * 0.08}>
              <Link
                href={category.href}
                className="group flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-card transition-colors duration-200 ease-out hover:border-primary hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-muted">
                  <Icon className="h-8 w-8 text-foreground" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight transition-colors duration-200 ease-out group-hover:text-primary-strong">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                )}
                <p className="mt-3 text-sm tabular-nums text-muted-foreground">
                  {category.count} {category.count === 1 ? "product" : "products"}
                </p>
              </Link>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn>
        <div className="mt-16 flex flex-col items-center rounded-card border border-border bg-muted p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Can&apos;t find what you&apos;re looking for?</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Tell us what you need and we&apos;ll help you source it.
          </p>
          <a
            href={ownerWhatsAppHref(
              OWNER_PHONES[0],
              "Hi Zionstone, I'm looking for something I couldn't find on your site."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        </div>
      </FadeIn>
    </div>
  );
}
