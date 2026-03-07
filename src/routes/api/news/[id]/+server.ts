import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();
  const { title, content, category, published } = body;

  const item = await prisma.news.update({
    where: { id },
    data: {
      ...(title && { title: String(title).trim() }),
      ...(content && { content: String(content).trim() }),
      ...(category && { category: String(category) }),
      ...(published !== undefined && { published: Boolean(published) }),
    },
  });

  return json(item);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  await prisma.news.delete({ where: { id } });
  return json({ success: true });
};
