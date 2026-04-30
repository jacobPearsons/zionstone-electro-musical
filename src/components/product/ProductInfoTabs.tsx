'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Star, ThumbsUp, Truck, RotateCcw, Shield, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  images?: string[];
}

interface ProductTabsProps {
  description: string;
  specs?: Record<string, string>;
  features?: string[];
  reviews?: Review[];
  reviewStats?: {
    average: number;
    total: number;
    breakdown: Record<number, number>;
  };
}

export function ProductInfoTabs({ 
  description, 
  specs = {}, 
  features = [],
  reviews = [],
  reviewStats = { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
      <Tabs.List className="flex border-b w-full overflow-x-auto">
        {['Description', 'Specifications', 'Reviews', 'Shipping & Returns'].map((tab) => {
          const value = tab.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
          const isActive = activeTab === value;
          const count = tab === 'Reviews' && reviewStats.total > 0 ? ` (${reviewStats.total})` : '';
          
          return (
            <Tabs.Trigger
              key={tab}
              value={value}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                isActive 
                  ? 'border-purple-600 text-yellow-600' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}{count}
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>

      {/* Description Tab */}
      <Tabs.Content value="description" className="pt-6">
        <div className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed">{description}</p>
          {features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-600 mt-1 fill-purple-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Tabs.Content>

      {/* Specifications Tab */}
      <Tabs.Content value="specifications" className="pt-6">
        {Object.keys(specs).length > 0 ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <dt className="text-muted-foreground">{key}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted-foreground">No specifications available.</p>
        )}
      </Tabs.Content>

      {/* Reviews Tab */}
      <Tabs.Content value="reviews" className="pt-6">
        {reviewStats.total === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium">No reviews yet</h3>
            <p className="text-muted-foreground mt-1">Be the first to review this product</p>
            <Button className="mt-4">Write a Review</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="grid md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-4xl font-bold">{reviewStats.average.toFixed(1)}</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(reviewStats.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Based on {reviewStats.total} reviews</p>
              </div>
              <div className="space-y-2 col-span-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.breakdown[star] || 0;
                  const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-6">{star}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        {review.author[0]}
                      </div>
                      <div>
                        <p className="font-medium">{review.author}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{review.date}</span>
                          {review.verified && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">Verified Purchase</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-medium mt-3">{review.title}</h4>
                  <p className="text-muted-foreground mt-1">{review.content}</p>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-3">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              ))}
            </div>

            {/* Write Review */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="p-1 hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-gray-300 hover:fill-yellow-400 hover:text-yellow-400" />
                    </button>
                  ))}
                </div>
                <Input placeholder="Review title" />
                <textarea
                  placeholder="Write your review..."
                  className="w-full min-h-[100px] p-3 border rounded-lg"
                />
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        )}
      </Tabs.Content>

      {/* Shipping & Returns Tab */}
      <Tabs.Content value="shipping-returns" className="pt-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <Truck className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
            <h4 className="font-medium">Free Shipping</h4>
            <p className="text-sm text-muted-foreground mt-1">
              On orders over $50. 2-5 business days
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <RotateCcw className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
            <h4 className="font-medium">Easy Returns</h4>
            <p className="text-sm text-muted-foreground mt-1">
              30-day return window. Free return shipping
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <Shield className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
            <h4 className="font-medium">Warranty</h4>
            <p className="text-sm text-muted-foreground mt-1">
              2-year manufacturer warranty included
            </p>
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}