import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.admin) redirect(302, '/admin/login');

  const users = await prisma.user.findMany({
    orderBy: { username: 'asc' },
    include: { team: { select: { updatedAt: true, pokemons: { select: { id: true } } } } },
  });

  return { users };
};
