import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const [tournaments, upcomingMatches] = await Promise.all([
    prisma.tournament.findMany({
      where: { active: true },
      orderBy: { startDate: 'asc' },
      include: {
        _count: { select: { players: true } },
      },
    }),
    prisma.match.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
        tournament: { select: { id: true, name: true } },
      },
    }),
  ]);

  return { tournaments, upcomingMatches };
};
