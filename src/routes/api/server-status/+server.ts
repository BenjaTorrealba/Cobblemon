import { json } from '@sveltejs/kit';
import { status } from 'minecraft-server-util';
import type { RequestHandler } from './$types.js';

const SERVER_HOST = 'wish-underline.gl.joinmc.link';
const SERVER_PORT = 25565;

export const GET: RequestHandler = async () => {
  try {
    const result = await status(SERVER_HOST, SERVER_PORT, { timeout: 5000 });
    return json({
      online: true,
      ping: result.roundTripLatency,
      players: {
        online: result.players.online,
        max: result.players.max,
        list: result.players.sample?.map((p) => p.name) ?? [],
      },
      version: result.version.name,
      motd: result.motd.clean,
    });
  } catch {
    return json({
      online: false,
      ping: null,
      players: { online: 0, max: 0, list: [] },
      version: null,
      motd: null,
    });
  }
};
