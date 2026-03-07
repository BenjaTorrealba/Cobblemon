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
      player1: true,
      player2: true,
      winner: true,
      tournament: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return json(matches);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { tournamentId, player1Id, player2Id, scheduledAt } = body;

  if (!tournamentId || !player1Id || !player2Id || !scheduledAt) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (Number(player1Id) === Number(player2Id)) {
    return json({ error: 'Players must be different' }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      tournamentId: Number(tournamentId),
      player1Id: Number(player1Id),
      player2Id: Number(player2Id),
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
    },
    include: {
      player1: true,
      player2: true,
      tournament: { select: { id: true, name: true } },
    },
  });

  return json(match, { status: 201 });
};
