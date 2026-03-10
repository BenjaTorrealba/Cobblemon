import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

// GET /api/posts?cursor=...  — paginated feed
export const GET: RequestHandler = async ({ url }) => {
  const cursor = url.searchParams.get('cursor');
  const take = 20;

  const posts = await (prisma as any).post.findMany({
    take,
    ...(cursor ? { skip: 1, cursor: { id: parseInt(cursor) } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { username: true, favoritePokemonId: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { username: true, favoritePokemonId: true } } },
      },
    },
  });

  const next = posts.length === take ? posts[posts.length - 1].id : null;
  return json({ posts, next });
};

// POST /api/posts — create post
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim().slice(0, 2000) : '';
  if (!content) return json({ error: 'El post no puede estar vacío' }, { status: 400 });

  const post = await (prisma as any).post.create({
    data: { authorId: locals.user.id, content },
    include: {
      author: { select: { username: true, favoritePokemonId: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { username: true, favoritePokemonId: true } } },
      },
    },
  });

  return json(post, { status: 201 });
};
