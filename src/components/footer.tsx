import Link from "next/link";
import Image from "next/image";
import { Newsletter } from "./Newsletter";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter */}
        <div className="mb-12">
          <Newsletter />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="/products?category=guitars-basses" className="text-muted-foreground hover:text-primary">Guitars & Basses</Link></li>
              <li><Link href="/products?category=keyboards-synths" className="text-muted-foreground hover:text-primary">Keyboards & Synths</Link></li>
              <li><Link href="/products?category=recording-gear" className="text-muted-foreground hover:text-primary">Recording Gear</Link></li>
              <li><Link href="/products?category=drums-percussion" className="text-muted-foreground hover:text-primary">Drums & Percussion</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/shipping" className="text-muted-foreground hover:text-primary">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-primary">Returns</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="/press" className="text-muted-foreground hover:text-primary">Press</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/accessibility" className="text-muted-foreground hover:text-primary">Accessibility</Link></li>
            </ul>
          </div>
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
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
         
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ElectroMuscial Store. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary">Facebook</a>
            <a href="#" className="text-muted-foreground hover:text-primary">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-primary">Instagram</a>
            <a href="#" className="text-muted-foreground hover:text-primary">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}