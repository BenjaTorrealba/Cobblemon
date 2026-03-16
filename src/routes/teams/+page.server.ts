import type { PageServerLoad } from './$types.js';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async () => {
  const teams = await prisma.team.findMany({
    where: { published: true },
    include: {
      user: { select: { username: true } },
      pokemons: { orderBy: { slot: 'asc' } },
    },
    orderBy: [{ user: { username: 'asc' } }, { updatedAt: 'desc' }],
  });
  return { teams };
};
