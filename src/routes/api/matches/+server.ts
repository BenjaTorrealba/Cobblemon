import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url }) => {
  const tournamentId = url.searchParams.get('tournamentId');
  const upcoming = url.searchParams.get('upcoming');

  const where: Record<string, unknown> = {};
  if (tournamentId) where.tournamentId = Number(tournamentId);
  if (upcoming === 'true') {
    where.status = 'scheduled';
    where.scheduledAt = { gte: new Date() };
  }

  const matches = await prisma.match.findMany({
    where,
    include: {
      user1: { select: { id: true, username: true } },
      user2: { select: { id: true, username: true } },
      winner: { select: { id: true, username: true } },
      tournament: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return json(matches);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { tournamentId, user1Id, user2Id, scheduledAt } = body;

  if (!tournamentId || !user1Id || !user2Id || !scheduledAt) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (Number(user1Id) === Number(user2Id)) {
    return json({ error: 'Los usuarios deben ser distintos' }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      tournamentId: Number(tournamentId),
      user1Id: Number(user1Id),
      user2Id: Number(user2Id),
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
    },
    include: {
      user1: { select: { id: true, username: true } },
      user2: { select: { id: true, username: true } },
      tournament: { select: { id: true, name: true } },
    },
  });

  return json(match, { status: 201 });
};
