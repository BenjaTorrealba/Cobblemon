import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

const ALLOWED_EMOJIS = ['❤️', '😂', '🔥', '👏', '😮', '😢', '👀', '💯'];

// POST /api/reactions — toggle reaction (add or remove)
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const emoji = typeof body.emoji === 'string' ? body.emoji : '';
  if (!ALLOWED_EMOJIS.includes(emoji)) return json({ error: 'Emoji no permitido' }, { status: 400 });

  const teamId = typeof body.teamId === 'number' ? body.teamId : null;
  const newsId = typeof body.newsId === 'number' ? body.newsId : null;
  if (!teamId && !newsId) return json({ error: 'Debe especificar teamId o newsId' }, { status: 400 });

  const where = teamId
    ? { userId_emoji_teamId: { userId: locals.user.id, emoji, teamId } }
    : { userId_emoji_newsId: { userId: locals.user.id, emoji, newsId: newsId! } };

  const existing = await prisma.reaction.findUnique({ where } as Parameters<typeof prisma.reaction.findUnique>[0]);

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return json({ action: 'removed', emoji });
  }

  await prisma.reaction.create({
    data: {
      userId: locals.user.id,
      emoji,
      ...(teamId ? { teamId } : {}),
      ...(newsId ? { newsId } : {}),
    },
  });

  return json({ action: 'added', emoji });
};
