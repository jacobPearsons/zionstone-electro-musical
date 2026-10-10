'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { 
  User, Package, Heart, MapPin, CreditCard, Settings, 
  ChevronRight, Truck, Clock, CheckCircle, XCircle, Music,
  ShoppingCart, Trash2, Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';

const orders = [
  { 
    id: 'ORD-2026-001', 
    date: 'Mar 15, 2026', 
    status: 'delivered', 
    total: 1249.00, 
    items: 2,
    trackingNumber: '1Z999AA10123456784',
    estimatedDelivery: 'Mar 15, 2026',
    trackingSteps: [
      { label: 'Order Placed', date: 'Mar 12, 2026', completed: true, current: false },
      { label: 'Processing', date: 'Mar 13, 2026', completed: true, current: false },
      { label: 'Shipped', date: 'Mar 14, 2026', completed: true, current: false },
      { label: 'Out for Delivery', date: 'Mar 15, 2026', completed: true, current: false },
      { label: 'Delivered', date: 'Mar 15, 2026', completed: true, current: true },
    ]
  },
  { 
    id: 'ORD-2026-002', 
    date: 'Mar 18, 2026', 
    status: 'shipped', 
    total: 849.00, 
    items: 1,
    trackingNumber: '1Z999AA10123456785',
    estimatedDelivery: 'Mar 21, 2026',
    trackingSteps: [
      { label: 'Order Placed', date: 'Mar 18, 2026', completed: true, current: false },
      { label: 'Processing', date: 'Mar 18, 2026', completed: true, current: false },
      { label: 'Shipped', date: 'Mar 19, 2026', completed: true, current: true },
      { label: 'Out for Delivery', date: '', completed: false, current: false },
      { label: 'Delivered', date: '', completed: false, current: false },
    ]
  },
  { 
    id: 'ORD-2026-003', 
    date: 'Mar 19, 2026', 
    status: 'processing', 
    total: 399.00, 
    items: 1,
    trackingNumber: null,
    estimatedDelivery: 'Mar 24, 2026',
    trackingSteps: [
      { label: 'Order Placed', date: 'Mar 19, 2026', completed: true, current: false },
      { label: 'Processing', date: '', completed: false, current: true },
      { label: 'Shipped', date: '', completed: false, current: false },
      { label: 'Out for Delivery', date: '', completed: false, current: false },
      { label: 'Delivered', date: '', completed: false, current: false },
    ]
  },
];

const wishlist = [
  { id: '1', name: 'Moog Subsequent 37', brand: 'Moog', price: 1599, emoji: '🎹', slug: 'moog-subsequent-37' },
  { id: '2', name: 'Universal Audio Apollo Twin X', brand: 'Universal Audio', price: 1299, emoji: '🎤', slug: 'ua-apollo-twin-x' },
];

const addresses = [
  { id: '1', name: 'Home', address: '123 Music Lane, Los Angeles, CA 90210', default: true },
  { id: '2', name: 'Studio', address: '456 Sound Ave, Hollywood, CA 90028', default: false },
];

const tabs = [
  { id: 'orders', name: 'Orders', icon: Package },
  { id: 'wishlist', name: 'Wishlist', icon: Heart },
  { id: 'addresses', name: 'Addresses', icon: MapPin },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { addItem } = useCart();

  // There is no `isLoaded` branch here any more, and there was never a reason
  // for one. Every value this page renders is a module constant, so there is no
  // fetch to wait for, and Clerk hands the session to the client through the SSR
  // state — `useUser()` is populated on the first client render, not a tick
  // later. The `animate-pulse` "Loading..." that stood here was therefore a
  // permanent fake loading state (spec §3.10, §5 "Segment loading"), and the
  // skeleton the spec asked for would have been the same lie in a nicer frame:
  // there is nothing to wait for. The single `!user` guard below is the real one,
  // and it is the only state that is genuinely reachable.
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">Sign in required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to view your dashboard</p>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  // The only gold left in this page's chrome is the gold that encodes something:
  // the active tab, the `shipped` status glyph below, the current tracking step,
  // and the "Default" address chip. The avatar well, the four stat chips and the
  // address pin were `bg-primary/10` / `text-primary` and are now `bg-muted` /
  // `text-foreground` / `text-muted-foreground` — four identical gold circles in
  // one row are a pattern, not an accent (spec §3.10, §1 "spend gold once").
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      case 'shipped': return <Truck className="w-4 h-4 text-primary" aria-hidden="true" />;
      case 'processing': return <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" aria-hidden="true" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-foreground" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.firstName || 'Musician'}!</h1>
            <p className="text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <Link
        href="/dashboard/queue"
        className="mb-8 flex items-center justify-between gap-4 rounded-card border border-border bg-card p-6 shadow-card transition-colors duration-200 ease-out hover:bg-muted"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-card flex items-center justify-center">
            <Inbox className="w-5 h-5 text-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium">Review product submissions</p>
            <p className="text-sm text-muted-foreground">Approve or reject gear submitted for sale.</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
      </Link>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-card border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-card flex items-center justify-center">
              <Package className="w-5 h-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="rounded-card border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-card flex items-center justify-center">
              <Heart className="w-5 h-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{wishlist.length}</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </div>
          </div>
        </div>
        <div className="rounded-card border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-card flex items-center justify-center">
              <Truck className="w-5 h-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">1</p>
              <p className="text-sm text-muted-foreground">In Transit</p>
            </div>
          </div>
        </div>
        <div className="rounded-card border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-card flex items-center justify-center">
              <MapPin className="w-5 h-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{addresses.length}</p>
              <p className="text-sm text-muted-foreground">Saved Addresses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors duration-200 ease-out ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-primary/10 hover:text-primary-strong'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-card border border-border bg-card p-6">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Order History</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            {orders.map((order) => (
              <div key={order.id} className="rounded-card border border-border overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer transition-colors duration-200 ease-out hover:bg-muted"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-card flex items-center justify-center">
                      <Music className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date} • {order.items} item{order.items > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatPrice(order.total)}</p>
                      <div className="flex items-center gap-1 text-sm">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ease-out ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                {/* Expanded Order Tracking */}
                {expandedOrder === order.id && (
                  <div className="border-t border-border p-4 bg-muted">
                    {/* Tracking Progress */}
                    <div className="mb-4">
                      <h4 className="font-medium tracking-tight mb-3">Order Tracking</h4>
                      <div className="relative">
                        <div className="flex justify-between mb-2">
                          {order.trackingSteps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1">
                              <div className={`w-3 h-3 rounded-full ${step.completed ? 'bg-emerald-500' : step.current ? 'bg-primary' : 'bg-border'}`} />
                              <span className="text-xs mt-1 text-center">{step.label}</span>
                              {step.date && <span className="text-[10px] text-muted-foreground">{step.date}</span>}
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-border -z-10">
                          <div 
                            className="h-full bg-emerald-500 transition-all"
                            style={{ 
                              width: `${(order.trackingSteps.filter(s => s.completed).length / (order.trackingSteps.length - 1)) * 100}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {order.trackingNumber && (
                      <p className="text-sm text-muted-foreground mb-3">
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                    )}
                    
                    {order.estimatedDelivery && (
                      <p className="text-sm text-muted-foreground">
                        Estimated delivery: <span className="font-medium">{order.estimatedDelivery}</span>
                      </p>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">View Details</Button>
                      {order.trackingNumber && (
                        <Button variant="ghost" size="sm">
                          <Truck className="w-4 h-4 mr-2" aria-hidden="true" />
                          Track Package
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Your Wishlist</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/products">Browse More</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-card border border-border bg-card p-4 transition-colors duration-200 ease-out hover:bg-muted">
                  <div className="w-16 h-16 bg-muted rounded-card flex items-center justify-center text-3xl">
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.brand}</p>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="font-semibold tabular-nums text-primary-strong">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm"
                      onClick={() => {
                        addItem({
                          productId: item.id,
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          quantity: 1,
                          image: item.emoji,
                          brand: item.brand,
                        });
                        toast.success(`${item.name} added to cart`);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
                      Add to Cart
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive transition-colors duration-200 ease-out hover:bg-destructive/10" aria-label="Remove from wishlist">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Saved Addresses</h2>
              <Button variant="outline" size="sm">Add New</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="rounded-card border border-border bg-card p-4 transition-colors duration-200 ease-out hover:bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">{addr.name}</span>
                    {addr.default && (
                      <span className="text-xs font-medium bg-primary/10 text-primary-strong px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.address}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">Edit</Button>
                    {!addr.default && (
                      <Button variant="ghost" size="sm">Set as Default</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold tracking-tight">Account Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium tracking-tight">Profile Information</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="profile-first-name" className="text-sm text-muted-foreground">First Name</label>
                    <input 
                      id="profile-first-name"
                      type="text" 
                      defaultValue={user.firstName || ''}
                      autoComplete="given-name"
                      className="w-full p-2 rounded-card border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-last-name" className="text-sm text-muted-foreground">Last Name</label>
                    <input 
                      id="profile-last-name"
                      type="text" 
                      defaultValue={user.lastName || ''}
                      autoComplete="family-name"
                      className="w-full p-2 rounded-card border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="text-sm text-muted-foreground">Email</label>
                    <input 
                      id="profile-email"
                      type="email" 
                      defaultValue={user.emailAddresses[0]?.emailAddress}
                      autoComplete="email"
                      className="w-full p-2 rounded-card border border-input bg-background"
                      disabled
                    />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium tracking-tight">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                    <span className="text-sm">Order updates via email</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                    <span className="text-sm">Promotions and deals</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                    <span className="text-sm">Price drop alerts</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                    <span className="text-sm">New product announcements</span>
                  </label>
                </div>
                <Button>Save Preferences</Button>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-medium tracking-tight text-destructive mb-3">Danger Zone</h3>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
