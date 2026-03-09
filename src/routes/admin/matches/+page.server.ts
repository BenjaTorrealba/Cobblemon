import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const [matches, tournaments, users] = await Promise.all([
    prisma.match.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
        winner: { select: { id: true, username: true } },
        tournament: { select: { id: true, name: true } },
      },
    }),
    prisma.tournament.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({ orderBy: { username: 'asc' }, select: { id: true, username: true } }),
  ]);

  return { matches, tournaments, users };
};
