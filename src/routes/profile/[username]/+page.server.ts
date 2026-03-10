import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ params, locals }) => {
  const profileUser = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      teams: {
        where: { published: true },
        include: { pokemons: { orderBy: { slot: 'asc' } } },
        orderBy: { updatedAt: 'desc' },
      },
      tournamentEntries: {
        include: {
          tournament: { select: { id: true, name: true } },
          registeredTeam: { select: { name: true } },
        },
        orderBy: { registeredAt: 'desc' },
      },
      matchesAsUser1: {
        where: { status: 'completed' },
        include: {
          user2: { select: { username: true } },
          winner: { select: { id: true } },
          tournament: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 20,
      },
      matchesAsUser2: {
        where: { status: 'completed' },
        include: {
          user1: { select: { username: true } },
          winner: { select: { id: true } },
          tournament: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 20,
      },
      wonMatches: { select: { id: true } },
    },
  });

  if (!profileUser) error(404, 'Usuario no encontrado');

  const totalMatches = profileUser.matchesAsUser1.length + profileUser.matchesAsUser2.length;
  const wins = profileUser.wonMatches.length;

  // Merge matches into one list with a unified shape
  const recentMatches = [
    ...profileUser.matchesAsUser1.map(m => ({
      id: m.id,
      tournamentName: m.tournament.name,
      opponentUsername: m.user2.username,
      won: m.winner?.id === profileUser.id,
      scheduledAt: m.scheduledAt,
    })),
    ...profileUser.matchesAsUser2.map(m => ({
      id: m.id,
      tournamentName: m.tournament.name,
      opponentUsername: m.user1.username,
      won: m.winner?.id === profileUser.id,
      scheduledAt: m.scheduledAt,
    })),
  ].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()).slice(0, 10);

  const isOwnProfile = locals.user?.username === params.username;

  return {
    profileUser: {
      id: profileUser.id,
      username: profileUser.username,
      bio: profileUser.bio,
      favoritePokemonId: profileUser.favoritePokemonId,
      createdAt: profileUser.createdAt,
    },
    teams: profileUser.teams,
    tournamentEntries: profileUser.tournamentEntries,
    stats: { totalMatches, wins, losses: totalMatches - wins },
    recentMatches,
    isOwnProfile,
  };
};
