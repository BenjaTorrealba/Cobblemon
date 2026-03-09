import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/login');

  const teams = await prisma.team.findMany({
    where: { userId: locals.user.id },
    include: { pokemons: { orderBy: { slot: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  });

  return { user: locals.user, teams };
};
