import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

const REGION_KEYS = [
  'kantoCompleted', 'johtoCompleted', 'hoennCompleted', 'sinnohCompleted',
  'unovaCompleted', 'kalosCompleted', 'alolaCompleted', 'galarCompleted', 'paldeaCompleted',
] as const;

// PATCH /api/profile — update own bio, favoritePokemonId, pokedex, regions
export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (typeof body.bio === 'string') data.bio = body.bio.slice(0, 300);
  if (typeof body.favoritePokemonId === 'number') data.favoritePokemonId = body.favoritePokemonId;
  if (typeof body.pokedexSeen === 'number') data.pokedexSeen = Math.max(0, body.pokedexSeen);
  if (typeof body.pokedexCaught === 'number') data.pokedexCaught = Math.max(0, body.pokedexCaught);
  for (const key of REGION_KEYS) {
    if (typeof body[key] === 'boolean') data[key] = body[key];
  }

  const updated = await prisma.user.update({ where: { id: locals.user.id }, data });
  return json(updated);
};
