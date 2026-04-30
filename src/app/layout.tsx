import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { RecentlyViewedProvider } from "@/lib/recently-viewed-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ElectroMuscial Store | Premium Musical Instruments & Studio Equipment",
  description: "Your trusted destination for musical instruments and professional audio equipment. Shop guitars, drums, keyboards, studio gear, and more.",
  keywords: ["musical instruments", "audio equipment", "guitars", "drums", "studio equipment", "electronics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <div className="flex min-h-screen flex-col">
                  <AnnouncementBar 
                    message="Free 2-Day Shipping on orders over $50" 
                    link="/products"
                    linkText="Learn More"
                  />
                  <Header />
                  <main className="flex-1">{children}</main>
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
