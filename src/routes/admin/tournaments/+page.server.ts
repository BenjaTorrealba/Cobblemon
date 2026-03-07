import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { players: true, matches: true } },
    },
  });

  const players = await prisma.player.findMany({ orderBy: { name: 'asc' } });

  return { tournaments, players };
};
