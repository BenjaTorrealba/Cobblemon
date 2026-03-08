import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ params }) => {
  const team = await prisma.team.findFirst({
    where: { user: { username: params.username } },
    include: {
      user: { select: { username: true } },
      pokemons: { orderBy: { slot: 'asc' } },
    },
  });

  if (!team) error(404, 'Equipo no encontrado');

  return { team };
};
