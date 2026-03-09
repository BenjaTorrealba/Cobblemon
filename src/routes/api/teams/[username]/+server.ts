import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params }) => {
  const teams = await prisma.team.findMany({
    where: { user: { username: params.username }, published: true },
    include: {
      user: { select: { username: true } },
      pokemons: { orderBy: { slot: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return json(teams);
};
