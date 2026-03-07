import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  if (token) {
    const session = getSession(token);
    if (session) {
      event.locals.admin = { id: session.adminId, username: session.username };
    } else {
      event.locals.admin = null;
    }
  } else {
    event.locals.admin = null;
  }

  return resolve(event);
};
