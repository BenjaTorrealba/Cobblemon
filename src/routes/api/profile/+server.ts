import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// PATCH /api/profile — update own bio + favoritePokemonId
export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const bio = typeof body.bio === 'string' ? body.bio.slice(0, 300) : undefined;
  const favoritePokemonId = typeof body.favoritePokemonId === 'number' ? body.favoritePokemonId : undefined;

  const updated = await prisma.user.update({
    where: { id: locals.user.id },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(favoritePokemonId !== undefined ? { favoritePokemonId } : {}),
    },
    select: { username: true, bio: true, favoritePokemonId: true },
  });

  return json(updated);
};
