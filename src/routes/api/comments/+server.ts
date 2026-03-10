import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// POST /api/comments — create comment on a team or news item
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim().slice(0, 1000) : '';
  if (!content) return json({ error: 'El comentario no puede estar vacío' }, { status: 400 });

  const teamId = typeof body.teamId === 'number' ? body.teamId : null;
  const newsId = typeof body.newsId === 'number' ? body.newsId : null;
  if (!teamId && !newsId) return json({ error: 'Debe especificar teamId o newsId' }, { status: 400 });

  // Verify target exists
  if (teamId) {
    const team = await prisma.team.findFirst({ where: { id: teamId, published: true } });
    if (!team) return json({ error: 'Equipo no encontrado' }, { status: 404 });
  }
  if (newsId) {
    const news = await prisma.news.findFirst({ where: { id: newsId, published: true } });
    if (!news) return json({ error: 'Noticia no encontrada' }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      authorId: locals.user.id,
      content,
      ...(teamId ? { teamId } : {}),
      ...(newsId ? { newsId } : {}),
    },
    include: { author: { select: { username: true } } },
  });

  return json(comment, { status: 201 });
};
