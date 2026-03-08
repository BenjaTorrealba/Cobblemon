import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { hashUserPassword } from '$lib/server/userAuth.js';
import type { RequestHandler } from './$types.js';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const { password } = await request.json();
  if (!password) return json({ error: 'Nueva contraseña requerida' }, { status: 400 });

  const user = await prisma.user.update({
    where: { id },
    data: { passwordHash: hashUserPassword(String(password)) },
  });
  return json(user);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.user.delete({ where: { id: Number(params.id) } });
  return json({ success: true });
};