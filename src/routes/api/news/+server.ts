import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url }) => {
  const all = url.searchParams.get('all') === 'true';

  const news = await prisma.news.findMany({
    where: all ? {} : { published: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return json(news);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, content, category, published } = body;

  if (!title || !content) {
    return json({ error: 'Título y contenido son obligatorios' }, { status: 400 });
  }

  const item = await prisma.news.create({
    data: {
      title: String(title).trim(),
      content: String(content).trim(),
      category: String(category ?? 'general'),
      published: published !== false,
    },
  });

  return json(item, { status: 201 });
};
