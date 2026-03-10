import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// POST /api/posts/[id]/like — toggle like
export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const postId = parseInt(params.id);
  const post = await (prisma as any).post.findUnique({ where: { id: postId } });
  if (!post) return json({ error: 'Not found' }, { status: 404 });

  const existing = await (prisma as any).postLike.findUnique({
    where: { postId_userId: { postId, userId: locals.user.id } },
  });

  if (existing) {
    await (prisma as any).postLike.delete({ where: { id: existing.id } });
  } else {
    await (prisma as any).postLike.create({ data: { postId, userId: locals.user.id } });
    // Notify post owner (skip if liking own post)
    if (post.authorId !== locals.user.id) {
      await (prisma as any).notification.create({
        data: {
          userId: post.authorId,
          type: 'like_post',
          message: `@${locals.user.username} le dio like a tu post`,
          link: '/wall',
        },
      });
    }
  }

  const count = await (prisma as any).postLike.count({ where: { postId } });
  return json({ liked: !existing, count });
};
