'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Action = 'approve' | 'reject';

export function QueueActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Action | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  const update = async (action: Action) => {
    setPending(action);
    try {
      const response = await fetch('/api/queue/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        toast.error(payload?.error ?? 'Could not update the submission');
        return;
      }

      toast.success(action === 'approve' ? 'Submission approved' : 'Submission rejected');
      startTransition(() => router.refresh());
    } catch {
      toast.error('Could not update the submission');
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null || isRefreshing;

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={busy} onClick={() => update('approve')}>
        {pending === 'approve' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Approve
      </Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => update('reject')}>
        {pending === 'reject' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <X className="mr-2 h-4 w-4" />
        )}
        Reject
      </Button>
    </div>
  );
}
