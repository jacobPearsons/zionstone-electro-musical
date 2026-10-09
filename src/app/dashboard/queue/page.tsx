import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Inbox } from 'lucide-react';
import { listQueue } from '@/lib/queue';
import { formatPrice } from '@/lib/utils';
import { categoryDisplayName } from '@/data/categories';
import { QueueActions } from './QueueActions';

export const dynamic = 'force-dynamic';

function submittedLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default async function DashboardQueuePage() {
  const items = await listQueue('pending');

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Review product submissions</h1>
        <p className="mt-2 text-muted-foreground">
          {items.length} {items.length === 1 ? 'submission' : 'submissions'} waiting for review.
        </p>
        {/* Approved items only move to queue/approved; publishing into the storefront is manual and requires a catalogue rebuild. */}
        <p className="mt-2 text-sm text-muted-foreground">
          Publishing is manual: approving an item queues it for the next catalogue rebuild, it does
          not appear in the store automatically.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-border bg-card px-6 py-16 text-center shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-lg font-medium">No submissions waiting</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New gear submitted from the sell page will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-card border border-border bg-card p-4 shadow-card md:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-card bg-muted md:h-28 md:w-28">
                  <Image
                    src={item.imagePath}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 7rem, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.brand && (
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {item.brand}
                        </p>
                      )}
                      <h2 className="text-lg font-semibold tracking-tight">{item.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {categoryDisplayName(item.category)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums text-primary-strong">
                        {item.price != null ? formatPrice(item.price, 'NGN') : 'Price on Request'}
                      </p>
                      <p className="text-xs text-muted-foreground">{submittedLabel(item.submittedAt)}</p>
                    </div>
                  </div>

                  {item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-pill bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 whitespace-pre-line text-sm text-foreground/90">
                    {item.description}
                  </p>

                  {item.contact && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Contact: <span className="font-medium text-foreground">{item.contact}</span>
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                    <QueueActions id={item.id} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
