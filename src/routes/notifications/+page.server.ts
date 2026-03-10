import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/login');

  const notifications = await (prisma as any).notification.findMany({
    where: { userId: locals.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Mark all as read
  await (prisma as any).notification.updateMany({
    where: { userId: locals.user.id, read: false },
    data: { read: true },
  });

  return { notifications };
};
