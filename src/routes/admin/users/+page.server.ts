import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.admin) redirect(302, '/admin/login');

  const [users, settings] = await Promise.all([
    prisma.user.findMany({
      orderBy: { username: 'asc' },
      include: { team: { select: { updatedAt: true, pokemons: { select: { id: true } } } } },
    }),
    prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, registrationCode: '' },
    }),
  ]);

  return { users, registrationCode: settings.registrationCode };
};
