import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
  const players = await prisma.player.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { tournaments: true } },
    },
  });
  return json(players);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name } = body;
  if (!name) return json({ error: 'Missing name' }, { status: 400 });

  const player = await prisma.player.create({
    data: { name: String(name).trim() },
  });

  return json(player, { status: 201 });
};
