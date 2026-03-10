import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// DELETE /api/posts/[id]
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const postId = parseInt(params.id);
  const post = await (prisma as any).post.findUnique({ where: { id: postId } });
  if (!post) return json({ error: 'Not found' }, { status: 404 });
  if (post.authorId !== locals.user.id && !locals.user.isAdmin)
    return json({ error: 'Forbidden' }, { status: 403 });

  await (prisma as any).post.delete({ where: { id: postId } });
  return json({ ok: true });
};
