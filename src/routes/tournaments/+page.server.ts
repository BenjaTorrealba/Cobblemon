import type { PageServerLoad } from './$types.js';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async () => {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { userEntries: true, matches: true } },
    },
  });
  return { tournaments };
};
