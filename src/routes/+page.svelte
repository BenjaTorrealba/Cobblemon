<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let { data } = $props();

  // Server status
  interface ServerStatus {
    online: boolean;
    ping: number | null;
    players: { online: number; max: number; list: string[] };
    version: string | null;
    motd: string | null;
  }

  let serverStatus: ServerStatus | null = $state(null);
  let statusLoading = $state(true);
  let statusError = $state(false);
  let interval: ReturnType<typeof setInterval>;

  async function fetchServerStatus() {
    try {
      statusError = false;
      const res = await fetch('/api/server-status');
      serverStatus = await res.json();
    } catch {
      statusError = true;
      serverStatus = { online: false, ping: null, players: { online: 0, max: 0, list: [] }, version: null, motd: null };
    } finally {
      statusLoading = false;
    }
  }

  onMount(() => {
    fetchServerStatus();
    interval = setInterval(fetchServerStatus, 30000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  // Group upcoming matches by day
  function formatDate(d: string | Date) {
    const date = new Date(d);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Hoy';
    if (isTomorrow) return 'Mañana';
    return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function formatTime(d: string | Date) {
    return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  const groupedMatches = $derived(() => {
    const groups: Record<string, typeof data.upcomingMatches> = {};
    for (const match of data.upcomingMatches) {
      const key = formatDate(match.scheduledAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(match);
    }
    return Object.entries(groups);
  });
</script>

<svelte:head>
  <title>Cobbleverse &mdash; Torneos de Cobblemon</title>
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden bg-poke-darker">
  <div class="absolute inset-0 bg-gradient-radial from-poke-accent/10 via-transparent to-transparent pointer-events-none"></div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <div class="inline-flex items-center gap-2 bg-poke-surface border border-poke-border rounded-full px-4 py-1.5 text-xs text-poke-accent mb-6">
      <span class="w-1.5 h-1.5 rounded-full bg-poke-accent animate-pulse"></span>
      Temporada activa
    </div>
    <h1 class="font-display text-2xl sm:text-3xl lg:text-4xl text-white mb-4 leading-relaxed">
      COBBLEVERSE<br/><span class="text-gradient">TOURNAMENTS</span>
    </h1>
    <p class="text-gray-400 text-lg max-w-xl mx-auto mb-8">
      Compite en los torneos oficiales del servidor Cobblemon. Demuestra tu habilidad y conquista la clasificación.
    </p>
    <a href="/news" class="btn-secondary">
      <span>📢</span> Ver noticias y anuncios
    </a>
  </div>
</section>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

  <!-- Server Status -->
  <section>
    <h2 class="section-title">
      <span class="text-poke-accent">⬡</span>
      Estado del Servidor
    </h2>

    <div class="card max-w-2xl glow-accent">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-white mb-1">Cobbleverse Server</h3>
          <p class="text-xs text-gray-500 font-mono">wish-underline.gl.joinmc.link</p>
        </div>
        {#if statusLoading}
          <div class="badge-scheduled animate-pulse">Verificando...</div>
        {:else if serverStatus?.online}
          <div class="badge-online">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ONLINE
          </div>
        {:else}
          <div class="badge-offline">
            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            OFFLINE
          </div>
        {/if}
      </div>

      {#if serverStatus?.online}
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-poke-surface2 rounded-lg p-3 border border-poke-border">
            <div class="text-xs text-gray-500 mb-1">Ping</div>
            <div class="text-xl font-bold text-white">{serverStatus.ping}<span class="text-sm text-gray-400 font-normal ml-1">ms</span></div>
          </div>
          <div class="bg-poke-surface2 rounded-lg p-3 border border-poke-border">
            <div class="text-xs text-gray-500 mb-1">Jugadores</div>
            <div class="text-xl font-bold text-white">
              {serverStatus.players.online}<span class="text-gray-500 font-normal">/{serverStatus.players.max}</span>
            </div>
          </div>
        </div>

        {#if serverStatus.players.list.length > 0}
          <div>
            <div class="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Jugadores conectados</div>
            <div class="flex flex-wrap gap-2">
              {#each serverStatus.players.list as player}
                <span class="bg-poke-surface2 border border-poke-border rounded-lg px-3 py-1 text-sm text-gray-300 font-mono">
                  {player}
                </span>
              {/each}
            </div>
          </div>
        {:else}
          <p class="text-sm text-gray-500 italic">No hay jugadores conectados</p>
        {/if}
      {:else if !statusLoading}
        <p class="text-sm text-gray-500">El servidor no está disponible en este momento.</p>
      {/if}

      <div class="mt-4 pt-4 border-t border-poke-border flex items-center justify-between">
        <span class="text-xs text-gray-600">Actualiza cada 30s</span>
        <button onclick={fetchServerStatus} class="text-xs text-poke-accent hover:underline">
          Actualizar ahora
        </button>
      </div>
    </div>
  </section>

  <!-- Active Tournaments -->
  <section>
    <h2 class="section-title">
      <span class="text-poke-gold">🏆</span>
      Torneos Activos
    </h2>

    {#if data.tournaments.length === 0}
      <div class="card text-center py-12">
        <p class="text-gray-500">No hay torneos activos en este momento.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.tournaments as tournament}
          <article class="card-hover flex flex-col">
            <div class="flex items-start justify-between mb-3">
              <span class="bg-poke-accent/20 text-poke-accent text-xs font-semibold px-2.5 py-1 rounded-full border border-poke-accent/30">
                {tournament.format}
              </span>
              <span class="text-xs text-gray-500">
                {new Date(tournament.startDate).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">{tournament.name}</h3>
            <p class="text-sm text-gray-400 flex-1 mb-4 line-clamp-2">{tournament.description}</p>
            <div class="flex items-center justify-between pt-4 border-t border-poke-border">
              <span class="text-xs text-gray-500">
                {tournament._count.players} participante{tournament._count.players !== 1 ? 's' : ''}
              </span>
              <a href="/tournaments/{tournament.id}" class="btn-primary text-sm py-2">
                Ver torneo →
              </a>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Upcoming Matches -->
  <section>
    <h2 class="section-title">
      <span class="text-poke-blue">⚔</span>
      Próximos Enfrentamientos
    </h2>

    {#if data.upcomingMatches.length === 0}
      <div class="card text-center py-12">
        <p class="text-gray-500">No hay enfrentamientos programados.</p>
      </div>
    {:else}
      <div class="space-y-6">
        {#each groupedMatches() as [day, matches]}
          <div>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-sm font-semibold text-poke-accent uppercase tracking-wider">{day}</div>
              <div class="flex-1 h-px bg-poke-border"></div>
            </div>
            <div class="space-y-2">
              {#each matches as match}
                <a href="/tournaments/{match.tournament.id}" class="flex items-center justify-between card-hover py-4 group">
                  <div class="flex items-center gap-4">
                    <span class="text-sm font-mono text-gray-500 w-12">{formatTime(match.scheduledAt)}</span>
                    <div class="flex items-center gap-3">
                      <span class="font-semibold text-white">{match.player1.name}</span>
                      <span class="text-xs text-gray-500 font-bold">VS</span>
                      <span class="font-semibold text-white">{match.player2.name}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-500 hidden sm:block">{match.tournament.name}</span>
                    <span class="badge-scheduled">Programado</span>
                  </div>
                </a>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

</div>
