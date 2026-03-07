import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const [matches, tournaments, players] = await Promise.all([
    prisma.match.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        player1: true,
        player2: true,
        winner: true,
        tournament: { select: { id: true, name: true } },
      },
    }),
    prisma.tournament.findMany({ orderBy: { name: 'asc' } }),
    prisma.player.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return { matches, tournaments, players };
};
