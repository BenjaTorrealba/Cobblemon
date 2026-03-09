import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
  const teams = await prisma.team.findMany({
    where: { published: true },
    include: {
      user: { select: { username: true } },
      pokemons: { orderBy: { slot: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return json(teams);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, description, pokemons, published } = body;

  const team = await prisma.team.upsert({
    where: { userId: locals.user.id },
    update: {
      name: String(name || 'Mi Equipo'),
      description: String(description || ''),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
    },
    create: {
      userId: locals.user.id,
      name: String(name || 'Mi Equipo'),
      description: String(description || ''),
      published: false,
    },
  });

  await prisma.teamPokemon.deleteMany({ where: { teamId: team.id } });

  if (Array.isArray(pokemons)) {
    for (const p of pokemons) {
      if (!p.pokemonName) continue;
      await prisma.teamPokemon.create({
        data: {
          teamId: team.id,
          slot: Number(p.slot),
          pokemonName: String(p.pokemonName),
          pokemonId: Number(p.pokemonId || 0),
          item: String(p.item || ''),
          ability: String(p.ability || ''),
          move1: String(p.move1 || ''),
          move2: String(p.move2 || ''),
          move3: String(p.move3 || ''),
          move4: String(p.move4 || ''),
        },
      });
    }
  }

  return json({ success: true });
};