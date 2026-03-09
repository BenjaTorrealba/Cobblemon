import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const tournamentId = Number(params.id);
  if (isNaN(tournamentId)) return json({ error: 'Invalid ID' }, { status: 400 });

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return json({ error: 'Torneo no encontrado' }, { status: 404 });
  if (!tournament.active) return json({ error: 'El torneo ya no está activo' }, { status: 400 });

  const existing = await prisma.userTournamentEntry.findUnique({
    where: { userId_tournamentId: { userId: locals.user.id, tournamentId } },
  });
  if (existing) return json({ error: 'Ya estás inscrito' }, { status: 400 });

  const { teamId } = await request.json();
  if (!teamId) return json({ error: 'Debes seleccionar un equipo' }, { status: 400 });

  const team = await prisma.team.findFirst({
    where: { id: Number(teamId), userId: locals.user.id },
    include: { pokemons: { orderBy: { slot: 'asc' } } },
  });
  if (!team) return json({ error: 'Equipo no encontrado' }, { status: 404 });

  const entry = await prisma.userTournamentEntry.create({
    data: {
      userId: locals.user.id,
      tournamentId,
      registeredTeam: {
        create: {
          name: team.name,
          description: team.description,
          pokemons: {
            create: team.pokemons.map(p => ({
              slot: p.slot,
              pokemonName: p.pokemonName,
              pokemonId: p.pokemonId,
              shiny: p.shiny ?? false,
              item: p.item,
              ability: p.ability,
              move1: p.move1,
              move2: p.move2,
              move3: p.move3,
              move4: p.move4,
            })),
          },
        },
      },
    },
    include: { registeredTeam: { include: { pokemons: { orderBy: { slot: 'asc' } } } } },
  });

  return json(entry, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const tournamentId = Number(params.id);
  if (isNaN(tournamentId)) return json({ error: 'Invalid ID' }, { status: 400 });

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return json({ error: 'Torneo no encontrado' }, { status: 404 });
  if (!tournament.active) return json({ error: 'No puedes desinscribirte de un torneo finalizado' }, { status: 400 });

  const entry = await prisma.userTournamentEntry.findUnique({
    where: { userId_tournamentId: { userId: locals.user.id, tournamentId } },
  });
  if (!entry) return json({ error: 'No estás inscrito' }, { status: 404 });

  await prisma.userTournamentEntry.delete({
    where: { userId_tournamentId: { userId: locals.user.id, tournamentId } },
  });

  return json({ success: true });
};

// Admin: toggle changesAllowed for a specific entry
// User: swap one pokemon in their registered team (consumes changesAllowed)
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const tournamentId = Number(params.id);
  if (isNaN(tournamentId)) return json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();

  // Admin path: toggle changesAllowed
  if (locals.admin) {
    const { entryId, changesAllowed } = body;
    if (entryId === undefined) return json({ error: 'Missing entryId' }, { status: 400 });

    const entry = await prisma.userTournamentEntry.update({
      where: { id: Number(entryId) },
      data: { changesAllowed: Boolean(changesAllowed) },
      include: {
        user: { select: { username: true } },
        registeredTeam: { include: { pokemons: { orderBy: { slot: 'asc' } } } },
      },
    });
    return json(entry);
  }

  // User path: swap one pokemon
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const entry = await prisma.userTournamentEntry.findUnique({
    where: { userId_tournamentId: { userId: locals.user.id, tournamentId } },
    include: { registeredTeam: true },
  });
  if (!entry) return json({ error: 'No estás inscrito' }, { status: 404 });
  if (!entry.changesAllowed) return json({ error: 'El admin no ha habilitado cambios para ti' }, { status: 403 });
  if (!entry.registeredTeam) return json({ error: 'No tienes equipo registrado' }, { status: 400 });

  const { slot, pokemonName, pokemonId, shiny, item, ability, move1, move2, move3, move4 } = body;
  if (!slot || !pokemonName) return json({ error: 'Faltan datos del Pokémon' }, { status: 400 });

  await prisma.registeredTeamPokemon.upsert({
    where: { teamId_slot: { teamId: entry.registeredTeam.id, slot: Number(slot) } },
    update: {
      pokemonName: String(pokemonName),
      pokemonId: Number(pokemonId || 0),
      shiny: Boolean(shiny ?? false),
      item: String(item || ''),
      ability: String(ability || ''),
      move1: String(move1 || ''),
      move2: String(move2 || ''),
      move3: String(move3 || ''),
      move4: String(move4 || ''),
    },
    create: {
      teamId: entry.registeredTeam.id,
      slot: Number(slot),
      pokemonName: String(pokemonName),
      pokemonId: Number(pokemonId || 0),
      shiny: Boolean(shiny ?? false),
      item: String(item || ''),
      ability: String(ability || ''),
      move1: String(move1 || ''),
      move2: String(move2 || ''),
      move3: String(move3 || ''),
      move4: String(move4 || ''),
    },
  });

  // Consume the change token
  await prisma.userTournamentEntry.update({
    where: { id: entry.id },
    data: { changesAllowed: false },
  });

  const updated = await prisma.userTournamentEntry.findUnique({
    where: { id: entry.id },
    include: { registeredTeam: { include: { pokemons: { orderBy: { slot: 'asc' } } } } },
  });

  return json(updated);
};
