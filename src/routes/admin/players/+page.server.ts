import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const users = await prisma.user.findMany({
    orderBy: { username: 'asc' },
    include: {
      _count: {
        select: {
          tournamentEntries: true,
          matchesAsUser1: true,
          matchesAsUser2: true,
        },
      },
    },
  });
  return { users };
};
