import { prisma } from '$lib/server/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  return { news };
};
