import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { hashUserPassword } from '$lib/server/userAuth.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });
  const users = await prisma.user.findMany({
    orderBy: { username: 'asc' },
    include: { team: { select: { updatedAt: true, pokemons: { select: { id: true } } } } },
  });
  return json(users);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });
  const { username, password } = await request.json();
  if (!username || !password) return json({ error: 'Faltan campos' }, { status: 400 });

  const user = await prisma.user.create({
    data: {
      username: String(username).trim(),
      passwordHash: hashUserPassword(String(password)),
    },
  });
  return json(user, { status: 201 });
};