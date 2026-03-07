import { prisma } from '$lib/server/prisma.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw error(404, 'Torneo no encontrado');

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      players: {
        include: { player: true },
        orderBy: { joinedAt: 'asc' },
      },
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

  if (!tournament) throw error(404, 'Torneo no encontrado');

  // Compute standings from completed matches
  const standings: Record<number, { player: { id: number; name: string }; played: number; wins: number; losses: number; points: number }> = {};

  for (const tp of tournament.players) {
    standings[tp.player.id] = {
      player: tp.player,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
    };
  }

  for (const match of tournament.matches) {
    if (match.status === 'completed' && match.winnerId) {
      const loserId = match.winnerId === match.player1Id ? match.player2Id : match.player1Id;

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

  return { tournament, standings: sortedStandings };
};
