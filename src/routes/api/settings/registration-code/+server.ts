import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { RequestHandler } from './$types.js';

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) return json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await request.json();

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { registrationCode: String(code ?? '').trim() },
    create: { id: 1, registrationCode: String(code ?? '').trim() },
  });

  return json({ success: true });
};
