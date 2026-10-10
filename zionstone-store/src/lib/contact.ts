/** Store-owner contact details used by /contact and the "Price on Request" CTAs. */
export const OWNER_EMAIL = "Zionstonee2020@Yahoo.com";

export interface OwnerPhone {
  /** Human-readable label, e.g. "+234 705 640 2875". */
  label: string;
  /** TEL: URL scheme value, e.g. "+2347056402875". */
  tel: string;
  /** Country-code-stripped number for wa.me links, e.g. "2347056402875". */
  wa: string;
}

export const OWNER_PHONES: OwnerPhone[] = [
  { label: "+234 705 640 2875", tel: "+2347056402875", wa: "2347056402875" },
  { label: "+234 816 299 6773", tel: "+2348162996773", wa: "2348162996773" },
];

export function ownerEmailHref(
  args: { subject?: string; body?: string } = {}
): string {
  const query = new URLSearchParams();
  if (args.subject) query.set("subject", args.subject);
  if (args.body) query.set("body", args.body);
  const qs = query.toString();
  return `mailto:${OWNER_EMAIL}${qs ? `?${qs}` : ""}`;
}

export function ownerWhatsAppHref(phone: OwnerPhone, message: string): string {
  return `https://wa.me/${phone.wa}?text=${encodeURIComponent(message)}`;
}

export function contactProductSubject(productName: string): string {
  return `Price inquiry: ${productName}`;
}

export function contactProductMessage(productName: string): string {
  return `Hello, I'm interested in the "${productName}". Please share the price and availability.`;
}