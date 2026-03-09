import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const [tournaments, users, matches] = await Promise.all([
    prisma.tournament.count(),
    prisma.user.count(),
    prisma.match.count(),
  ]);

  const recentMatches = await prisma.match.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user1: { select: { id: true, username: true } }, user2: { select: { id: true, username: true } }, tournament: { select: { name: true } } },
  });

  return { stats: { tournaments, players: users, matches }, recentMatches };
};
