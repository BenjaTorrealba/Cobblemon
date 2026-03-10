import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// DELETE /api/comments/[id] — only the author can delete their comment
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id: Number(params.id) } });
  if (!comment) return json({ error: 'Comentario no encontrado' }, { status: 404 });
  if (comment.authorId !== locals.user.id) return json({ error: 'Forbidden' }, { status: 403 });

  await prisma.comment.delete({ where: { id: comment.id } });
  return json({ ok: true });
};
