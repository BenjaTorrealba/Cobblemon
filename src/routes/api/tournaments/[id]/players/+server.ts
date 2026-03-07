import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const tournamentId = Number(params.id);
  if (isNaN(tournamentId)) return json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();
  const { playerId } = body;
  if (!playerId) return json({ error: 'Missing playerId' }, { status: 400 });

  const entry = await prisma.tournamentPlayer.create({
    data: {
      tournamentId,
      playerId: Number(playerId),
    },
    include: { player: true },
  });

  return json(entry, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const tournamentId = Number(params.id);
  if (isNaN(tournamentId)) return json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();
  const { playerId } = body;
  if (!playerId) return json({ error: 'Missing playerId' }, { status: 400 });

  await prisma.tournamentPlayer.delete({
    where: {
      tournamentId_playerId: {
        tournamentId,
        playerId: Number(playerId),
      },
    },
  });

  return json({ success: true });
};
