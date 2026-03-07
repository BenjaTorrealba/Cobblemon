import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return json({ error: 'Invalid ID' }, { status: 400 });

  await prisma.player.delete({ where: { id } });
  return json({ success: true });
};
