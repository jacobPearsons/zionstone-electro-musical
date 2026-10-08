import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactOwnerButtonProps {
  productName: string;
  productSlug: string;
  className?: string;
}

/**
 * The "Price on Request" action: redirects to /contact with the product name
 * prefilled so the shopper can reach the owner by email, phone or WhatsApp.
 */
export function ContactOwnerButton({
  productName,
  productSlug,
  className = "",
}: ContactOwnerButtonProps) {
  return (
    <Button asChild variant="outline" className={`w-full mt-3 ${className}`}>
      <Link href={`/contact?product=${encodeURIComponent(productSlug)}`}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact Owner
      </Link>
    </Button>
  );
}