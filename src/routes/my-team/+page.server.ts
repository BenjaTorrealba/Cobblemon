import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/login');

  const team = await prisma.team.findUnique({
    where: { userId: locals.user.id },
    include: { pokemons: { orderBy: { slot: 'asc' } } },
  });

  return { user: locals.user, team };
};
