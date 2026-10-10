'use client';

import { useEffect, useRef } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/product';
import { formatPrice } from '@/lib/utils';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // The element that had focus before the drawer opened, so focus can be
  // returned to it on close (WCAG 2.4.3 Focus Order).
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    // Move focus into the dialog so screen readers and keyboard users land
    // inside it rather than continuing through the page behind the overlay.
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // Trap Tab within the dialog while it is modal.
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer. `inert` + `aria-hidden` while closed keeps the off-screen cart
          out of both the tab order and the accessibility tree, so a keyboard
          user cannot Tab into a hidden panel. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-cart-title"
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              <h2 id="mini-cart-title" className="font-semibold tracking-tight">Your Cart</h2>
              <span className="text-sm text-muted-foreground">({totalItems})</span>
            </div>
            <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close cart">
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" aria-hidden="true" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Start shopping to add items</p>
                <Button asChild className="mt-4" onClick={onClose}>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <ProductImage image={item.image} name={item.name} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium tracking-tight line-clamp-2">{item.name}</h3>
                      {item.brand && (
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-4 h-4" aria-hidden="true" />
                          </Button>
                          <span className="w-8 text-center tabular-nums">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity, item.currency ?? 'NGN')}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium">Subtotal</span>
                <span className="text-base font-semibold tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Shipping and taxes calculated at checkout
              </p>
              <p className="text-xs text-muted-foreground mb-4">Pay securely with Paystack</p>
              <div className="space-y-2">
                <Button asChild className="w-full" onClick={onClose}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" onClick={onClose}>
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}