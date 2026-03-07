import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const [tournaments, players, matches] = await Promise.all([
    prisma.tournament.count(),
    prisma.player.count(),
    prisma.match.count(),
  ]);

  const recentMatches = await prisma.match.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { player1: true, player2: true, tournament: { select: { name: true } } },
  });

  return { stats: { tournaments, players, matches }, recentMatches };
};
