import Link from "next/link";
import { ArrowRight, LifeBuoy, MessageCircle, MonitorPlay, Puzzle, Users, Volume2, Waves } from "lucide-react";
import { OWNER_PHONES, ownerWhatsAppHref } from "@/lib/contact";
import { FadeIn } from "@/components/ui/animated";

export const metadata = {
  title: "About Us",
  description:
    "Professional sound reinforcement, studio and home cinema setup, and acoustic soundproofing from Zionstone Electro Musical.",
};

const services = [
  {
    icon: Volume2,
    title: "Sound Reinforcement Solutions",
    summary: "Professional sound systems for events, venues, and outdoor spaces.",
    points: [
      "Event and concert sound systems",
      "Venue installation and setup",
      "Speaker system design and installation",
      "Outdoor and temporary installations",
      "Real-time audio mixing and management",
    ],
  },
  {
    icon: MonitorPlay,
    title: "Studio & Home Cinema Setup",
    summary: "Complete setup and installation for professional studios and home theaters.",
    points: [
      "Professional studio design consultation",
      "Home cinema design and installation",
      "Equipment placement and connection",
      "Full system integration",
      "Installation from setup to completion",
    ],
  },
  {
    icon: Waves,
    title: "Acoustic Soundproofing",
    summary: "Expert acoustic treatment and soundproofing for any room.",
    points: [
      "Echo reduction",
      "Soundproofing",
      "Noise control",
      "Room acoustics",
      "Vocal booth & studio setup",
      "Acoustic design & installation",
    ],
  },
];

const reasons = [
  {
    icon: Users,
    title: "Expert Team",
    description: "Experienced engineers and technicians who handle every install from first survey to final sound check.",
  },
  {
    icon: Puzzle,
    title: "Custom Solutions",
    description: "Every room and every event is different, so every system is planned around your space and your budget.",
  },
  {
    icon: LifeBuoy,
    title: "Reliable Support",
    description: "We stay reachable after the work is done, ready to help with tuning, upgrades, and troubleshooting.",
  },
];

const stats = [
  { value: "500+", label: "Projects Done" },
  { value: "50+", label: "Venues Fitted" },
  { value: "10+", label: "Years Experience" },
  { value: "24/7", label: "Support" },
];

function requestHref(title: string): string {
  return ownerWhatsAppHref(OWNER_PHONES[0], `Hi, I'm interested in your ${title}.`);
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero / services intro */}
      <section id="services" className="scroll-mt-20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                What We Do
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Our Professional Services
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                From live sound to studio builds, Zionstone Electro Musical designs, supplies,
                and installs professional audio systems for events, venues, studios, and homes.
              </p>
            </FadeIn>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <FadeIn key={service.title} delay={index * 0.1}>
                  <div className="flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-card">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-muted">
                      <Icon className="h-7 w-7 text-foreground" aria-hidden="true" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">{service.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{service.summary}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {service.points.map((point) => (
                        <li key={point} className="flex gap-2 text-muted-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={requestHref(service.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Request Service
                    </a>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Why Us
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Trusted by Professionals
              </h2>
            </div>
          </FadeIn>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <FadeIn key={reason.title} delay={index * 0.1}>
                  <div className="flex h-full flex-col rounded-card border border-border bg-card p-6 text-center shadow-card">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-muted">
                      <Icon className="h-7 w-7 text-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{reason.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-card border border-border bg-card p-6 text-center shadow-card">
                  <p className="text-3xl font-semibold tracking-tight tabular-nums text-primary-strong md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto flex max-w-3xl flex-col items-center rounded-card border border-border bg-card p-8 text-center shadow-card md:p-12">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready to Gear Up?</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Browse the catalogue or talk to us about your next build. We&apos;ll help you get
                the right gear and the right setup.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Shop the Catalogue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={ownerWhatsAppHref(OWNER_PHONES[0], "Hi Zionstone, I'd like to talk about a project.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-pill border border-border px-6 py-3 text-sm font-medium transition-colors duration-200 ease-out hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Talk to Us
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
