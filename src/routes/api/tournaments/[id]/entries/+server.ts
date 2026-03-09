import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const tournamentId = Number(params.id);
  if (isNaN(tournamentId)) return json({ error: 'Invalid ID' }, { status: 400 });

  const entries = await prisma.userTournamentEntry.findMany({
    where: { tournamentId },
    include: {
      user: { select: { username: true } },
      registeredTeam: {
        include: { pokemons: { orderBy: { slot: 'asc' } } },
      },
    },
    orderBy: { registeredAt: 'asc' },
  });

  return json(entries);
};
