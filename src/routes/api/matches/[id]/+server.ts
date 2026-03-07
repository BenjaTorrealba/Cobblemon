import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();
  const { status, winnerId, scheduledAt } = body;

  const data: Record<string, unknown> = {};
  if (status) data.status = String(status);
  if (winnerId !== undefined) data.winnerId = winnerId ? Number(winnerId) : null;
  if (scheduledAt) data.scheduledAt = new Date(scheduledAt);

  const match = await prisma.match.update({
    where: { id },
    data,
    include: {
      player1: true,
      player2: true,
      winner: true,
    },
  });

  return json(match);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  await prisma.match.delete({ where: { id } });
  return json({ success: true });
};
