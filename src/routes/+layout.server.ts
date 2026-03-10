import type { LayoutServerLoad } from './$types.js';
import { prisma } from '$lib/server/prisma.js';

export const load: LayoutServerLoad = async ({ locals }) => {
  const unreadCount = locals.user
    ? await (prisma as any).notification.count({ where: { userId: locals.user.id, read: false } })
    : 0;
  return { user: locals.user, unreadCount };
};