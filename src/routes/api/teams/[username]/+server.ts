import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params }) => {
  const team = await prisma.team.findFirst({
    where: { user: { username: params.username } },
    include: {
      user: { select: { username: true } },
      pokemons: { orderBy: { slot: 'asc' } },
    },
  });
  if (!team) return json({ error: 'Not found' }, { status: 404 });
  return json(team);
};