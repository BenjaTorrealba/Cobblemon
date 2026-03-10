import type { PageServerLoad } from './$types.js';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ locals }) => {
  const posts = await (prisma as any).post.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { username: true, favoritePokemonId: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { username: true, favoritePokemonId: true } } },
      },
    },
  });

  return { user: locals.user, posts };
};
