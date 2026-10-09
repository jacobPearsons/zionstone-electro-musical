import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { listQueue, setQueueStatus } from '@/lib/queue';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, items: await listQueue() });
}

export async function PATCH(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown; action?: unknown }
    | null;
  const id = body?.id;
  const action = body?.action;

  if (typeof id !== 'string' || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json(
      { ok: false, error: "Expected { id, action: 'approve' | 'reject' }" },
      { status: 400 }
    );
  }

  try {
    const items = await setQueueStatus(id, action === 'approve' ? 'approved' : 'rejected');
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the submission';
    const status = message.startsWith('Invalid queue id') ? 400 : 404;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
