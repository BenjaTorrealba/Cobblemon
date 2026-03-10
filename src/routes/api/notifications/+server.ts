import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// GET /api/notifications — my notifications (newest 40)
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await (prisma as any).notification.findMany({
    where: { userId: locals.user.id },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });

  return json(notifications);
};

// POST /api/notifications — mark all as read
export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  await (prisma as any).notification.updateMany({
    where: { userId: locals.user.id, read: false },
    data: { read: true },
  });

  return json({ ok: true });
};
