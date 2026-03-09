import { prisma } from '$lib/server/prisma.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw error(404, 'Torneo no encontrado');

  const [tournament, userEntries, myTeams, myEntry] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            user1: { select: { id: true, username: true } },
            user2: { select: { id: true, username: true } },
            winner: { select: { id: true, username: true } },
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    }),
    prisma.userTournamentEntry.findMany({
      where: { tournamentId: id },
      include: {
        user: { select: { username: true } },
        registeredTeam: { include: { pokemons: { orderBy: { slot: 'asc' } } } },
      },
      orderBy: { registeredAt: 'asc' },
    }),
    locals.user
      ? prisma.team.findMany({
          where: { userId: locals.user.id },
          include: { pokemons: { orderBy: { slot: 'asc' } } },
          orderBy: { updatedAt: 'desc' },
        })
      : Promise.resolve([]),
    locals.user
      ? prisma.userTournamentEntry.findUnique({
          where: { userId_tournamentId: { userId: locals.user.id, tournamentId: id } },
          include: { registeredTeam: { include: { pokemons: { orderBy: { slot: 'asc' } } } } },
        })
      : Promise.resolve(null),
  ]);

  if (!tournament) throw error(404, 'Torneo no encontrado');

  // Compute standings from registered users + user-based matches
  const standings: Record<number, { user: { id: number; username: string }; played: number; wins: number; losses: number; points: number }> = {};
  for (const entry of userEntries) {
    standings[entry.user.id] = { user: { id: entry.user.id, username: entry.user.username }, played: 0, wins: 0, losses: 0, points: 0 };
  }
  for (const match of tournament.matches) {
    if (match.status === 'completed' && match.winnerId) {
      const loserId = match.winnerId === match.user1Id ? match.user2Id : match.user1Id;
      if (standings[match.winnerId]) {
        standings[match.winnerId].played++;
        standings[match.winnerId].wins++;
        standings[match.winnerId].points += 3;
      }
      if (standings[loserId]) {
        standings[loserId].played++;
        standings[loserId].losses++;
      }
    }
  }
  const sortedStandings = Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });

  return {
    tournament,
    standings: sortedStandings,
    userEntries,
    myTeams,
    myEntry,
    user: locals.user ?? null,
  };
};
