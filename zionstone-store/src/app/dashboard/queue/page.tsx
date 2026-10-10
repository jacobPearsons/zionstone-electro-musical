import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { ApiError, listQueue, type ApiQueuedProduct } from '@/lib/backend-api';
import { QueueList } from './QueueList';

export const dynamic = 'force-dynamic';

function describeQueueError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isUnavailable) {
      return 'Admin authentication is not configured on the API. The review queue is unavailable.';
    }
    if (error.status === 401) {
      return 'We could not verify your admin session. Please sign in again.';
    }
    return error.message;
  }
  return 'Could not load the review queue. Please try again.';
}

export default async function DashboardQueuePage() {
  let token: string | null = null;
  let items: ApiQueuedProduct[] = [];
  let error: string | null = null;

  try {
    token = await auth().getToken();
    items = (await listQueue('pending', token)).items;
  } catch (caught) {
    error = describeQueueError(caught);
  }

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
        {!error && (
          <p className="mt-2 text-muted-foreground">
            {items.length} {items.length === 1 ? 'submission' : 'submissions'} waiting for review.
          </p>
        )}
        {/* Approved items only move to queue/approved; publishing into the storefront is manual and requires a catalogue rebuild. */}
        <p className="mt-2 text-sm text-muted-foreground">
          Publishing is manual: approving an item queues it for the next catalogue rebuild, it does
          not appear in the store automatically.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-card border border-border bg-card px-6 py-10 text-center shadow-card"
        >
          <p className="text-lg font-medium">Review queue unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <QueueList initialItems={items} token={token} />
      )}
    </div>
  );
}
