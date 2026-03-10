import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// POST /api/posts/[id]/comments — add comment to a wall post
export const POST: RequestHandler = async ({ params, locals, request }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const postId = parseInt(params.id);
  const post = await (prisma as any).post.findUnique({ where: { id: postId } });
  if (!post) return json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim().slice(0, 1000) : '';
  if (!content) return json({ error: 'El comentario no puede estar vacío' }, { status: 400 });

  const comment = await (prisma as any).postComment.create({
    data: { postId, authorId: locals.user.id, content },
    include: { author: { select: { username: true, favoritePokemonId: true } } },
  });

  // Notify post owner
  if (post.authorId !== locals.user.id) {
    await (prisma as any).notification.create({
      data: {
        userId: post.authorId,
        type: 'comment_post',
        message: `@${locals.user.username} comentó en tu post`,
        link: '/wall',
      },
    });
  }

  return json(comment, { status: 201 });
};

// DELETE /api/posts/[id]/comments?cid=...
export const DELETE: RequestHandler = async ({ params, locals, url }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const cid = parseInt(url.searchParams.get('cid') ?? '');
  if (!cid) return json({ error: 'Missing cid' }, { status: 400 });

  const comment = await (prisma as any).postComment.findUnique({ where: { id: cid } });
  if (!comment) return json({ error: 'Not found' }, { status: 404 });
  if (comment.authorId !== locals.user.id && !locals.user.isAdmin)
    return json({ error: 'Forbidden' }, { status: 403 });

  await (prisma as any).postComment.delete({ where: { id: cid } });
  return json({ ok: true });
};
