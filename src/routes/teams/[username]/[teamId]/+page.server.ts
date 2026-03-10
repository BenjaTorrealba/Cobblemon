import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ params, locals }) => {
  const teamId = Number(params.teamId);
  if (isNaN(teamId)) error(404, 'Equipo no encontrado');

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      published: true,
      user: { username: params.username },
    },
    include: {
      user: { select: { username: true } },
      pokemons: { orderBy: { slot: 'asc' } },
      comments: {
        include: { author: { select: { username: true } } },
        orderBy: { createdAt: 'asc' },
      },
      reactions: true,
    },
  });

  if (!team) error(404, 'Equipo no encontrado');

  return { team, username: params.username, currentUser: locals.user ?? null };
};
