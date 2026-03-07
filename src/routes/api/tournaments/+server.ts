import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: 'asc' },
    include: {
      _count: { select: { players: true, matches: true } },
    },
  });
  return json(tournaments);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, description, format, rules, startDate, active } = body;

  if (!name || !description || !format || !rules || !startDate) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  const tournament = await prisma.tournament.create({
    data: {
      name: String(name),
      description: String(description),
      format: String(format),
      rules: String(rules),
      startDate: new Date(startDate),
      active: active !== false,
    },
  });

  return json(tournament, { status: 201 });
};
