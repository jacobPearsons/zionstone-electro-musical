'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Check, Inbox, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ApiError,
  listQueue,
  setQueueStatus,
  type ApiQueuedProduct,
  type QueueAction,
} from '@/lib/backend-api';
import { formatPrice } from '@/lib/utils';
import { categoryDisplayName } from '@/data/categories';

function submittedLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Client-side review queue. The server page fetches the first page and hands it
 * down with the Clerk token; mutations run here so the buttons can show pending
 * state and refresh the list without a full navigation.
 */
export function QueueList({
  initialItems,
  token,
}: {
  initialItems: ApiQueuedProduct[];
  token: string | null;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState<{ id: string; action: QueueAction } | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  const update = async (id: string, action: QueueAction) => {
    setPending({ id, action });
    try {
      // Prefer a fresh token over the one baked into the server render — it may
      // have expired since the page was requested.
      const freshToken = (await getToken()) ?? token;
      await setQueueStatus(id, action, freshToken);
      const { items: next } = await listQueue('pending', freshToken);
      setItems(next);
      toast.success(action === 'approve' ? 'Submission approved' : 'Submission rejected');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not update the submission');
    } finally {
      setPending(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border bg-card px-6 py-16 text-center shadow-card">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-lg font-medium">No submissions waiting</p>
        <p className="mt-1 text-sm text-muted-foreground">
          New gear submitted from the sell page will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const busy = pending !== null || isRefreshing;
        const isApproving = pending?.id === item.id && pending.action === 'approve';
        const isRejecting = pending?.id === item.id && pending.action === 'reject';

        return (
          <article
            key={item.id}
            className="rounded-card border border-border bg-card p-4 shadow-card md:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-card bg-muted md:h-28 md:w-28">
                {/* The API returns an absolute image URL (its own uploads host),
                    so a plain <img> avoids needing that host in next.config. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imagePath} alt={item.name} className="h-full w-full object-cover" />
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
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => update(item.id, 'approve')}>
                      {isApproving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => update(item.id, 'reject')}
                    >
                      {isRejecting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <X className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
