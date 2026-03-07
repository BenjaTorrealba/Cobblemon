import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      players: { include: { player: true } },
      matches: {
        include: {
          player1: true,
          player2: true,
          winner: true,
        },
        orderBy: { scheduledAt: 'asc' },
      },
    },
  });

  if (!tournament) return json({ error: 'Not found' }, { status: 404 });
  return json(tournament);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();
  const { name, description, format, rules, startDate, active } = body;

  const tournament = await prisma.tournament.update({
    where: { id },
    data: {
      ...(name && { name: String(name) }),
      ...(description && { description: String(description) }),
      ...(format && { format: String(format) }),
      ...(rules && { rules: String(rules) }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });

  return json(tournament);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  await prisma.tournament.delete({ where: { id } });
  return json({ success: true });
};
