import type { PageServerLoad } from './$types.js';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      favoritePokemonId: true,
      bio: true,
      createdAt: true,
      _count: {
        select: { teams: true, tournamentEntries: true, wonMatches: true },
      },
    },
  });
  return { users };
};
