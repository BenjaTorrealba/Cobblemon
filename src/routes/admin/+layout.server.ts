import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const isLoginPage = url.pathname === '/admin/login';

  if (!locals.admin && !isLoginPage) {
    throw redirect(303, '/admin/login');
  }

  if (locals.admin && isLoginPage) {
    throw redirect(303, '/admin');
  }

  return { admin: locals.admin };
};
