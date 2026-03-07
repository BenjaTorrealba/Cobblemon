import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const players = await prisma.player.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { tournaments: true, matchesAsPlayer1: true, matchesAsPlayer2: true } },
    },
  });
  return { players };
};
