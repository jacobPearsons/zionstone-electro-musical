'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProductBySlug } from '@/data/products';
import {
  OWNER_EMAIL,
  OWNER_PHONES,
  ownerEmailHref,
  ownerWhatsAppHref,
  contactProductMessage,
  contactProductSubject,
} from '@/lib/contact';

const inputClass =
  'block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function ContactContent() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product') ?? '';
  const product = productSlug ? getProductBySlug(productSlug) : undefined;
  const initialName = product?.name ?? searchParams.get('name') ?? '';

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [productName, setProductName] = useState(initialName);
  const [message, setMessage] = useState(
    initialName ? contactProductMessage(initialName) : ''
  );

  const subject = contactProductSubject(productName);
  const body = [
    message,
    senderName ? `Name: ${senderName}` : null,
    senderEmail ? `Email: ${senderEmail}` : null,
    senderPhone ? `Phone: ${senderPhone}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const emailHref = ownerEmailHref({ subject, body });
  const waMessage = message || contactProductMessage(productName);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Contact Us</h1>
      <p className="text-muted-foreground mt-2 mb-8 max-w-2xl">
        Have a question about a product, want a price, or need to arrange delivery?
        The owner is one message away.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Direct channels */}
        <div className="space-y-4">
          <div className="rounded-card border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Reach the owner directly</h2>

            {product && (
              <div className="mb-6 rounded-card border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="text-muted-foreground">You&apos;re asking about:</p>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-1 inline-block font-medium text-primary-strong underline-offset-4 transition-colors duration-200 ease-out hover:underline"
                >
                  {product.name}
                </Link>
              </div>
            )}

            <div className="space-y-3">
              <a
                href={`mailto:${OWNER_EMAIL}`}
                className="flex items-center gap-3 rounded-card border border-border p-4 transition-colors duration-200 ease-out hover:border-primary/40 hover:bg-muted"
              >
                <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="truncate text-sm text-muted-foreground">{OWNER_EMAIL}</p>
                </div>
              </a>

              {OWNER_PHONES.map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className="flex items-center gap-3 rounded-card border border-border p-4 transition-colors duration-200 ease-out hover:border-primary/40 hover:bg-muted"
                >
                  <Phone className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Call / SMS</p>
                    <p className="text-sm text-muted-foreground">{phone.label}</p>
                  </div>
                </a>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-2">
                {OWNER_PHONES.map((phone) => (
                  <Button
                    key={phone.tel}
                    asChild
                    variant="outline"
                    className="justify-start"
                  >
                    <a
                      href={ownerWhatsAppHref(phone, waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${phone.label}`}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                      WhatsApp
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry form */}
        <div className="rounded-card border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold tracking-tight mb-2">Send an inquiry</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Composing opens your email app with everything prefilled. Or tap a
            WhatsApp button to reach the owner instantly.
          </p>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = emailHref;
            }}
          >
            <div>
              <label htmlFor="contact-product" className="mb-1.5 block text-sm font-medium">
                Product of interest
              </label>
              <Input
                id="contact-product"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. The KRK Rokit 5 G4 Studio Monitor"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className={`${inputClass} min-h-28 resize-y`}
                placeholder="Hi, I'd like to know more about this item..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
                  Your name
                </label>
                <Input
                  id="contact-name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
                  Your email
                </label>
                <Input
                  id="contact-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium">
                Your phone (optional)
              </label>
              <Input
                id="contact-phone"
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="+234 ..."
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              <Send className="w-4 h-4 mr-2" aria-hidden="true" />
              Send via Email
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 md:py-16">Loading...</div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}