import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ params }) => {
  const teams = await prisma.team.findMany({
    where: { user: { username: params.username }, published: true },
    include: {
      user: { select: { username: true } },
      pokemons: { orderBy: { slot: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (teams.length === 0) error(404, 'Este jugador no tiene equipos publicados');

  return { teams, username: params.username };
};
