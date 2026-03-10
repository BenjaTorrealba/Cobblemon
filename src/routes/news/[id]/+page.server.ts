import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ params, locals }) => {
  const item = await prisma.news.findFirst({
    where: { id: Number(params.id), published: true },
    include: {
      comments: {
        include: { author: { select: { username: true } } },
        orderBy: { createdAt: 'asc' },
      },
      reactions: true,
    },
  });
  if (!item) error(404, 'Noticia no encontrada');
  return { item, currentUser: locals.user ?? null };
};
