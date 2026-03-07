<script lang="ts">
  let { data } = $props();
  const { stats, recentMatches } = data;
</script>

<svelte:head>
  <title>Dashboard &mdash; Admin Cobbleverse</title>
</svelte:head>

<div class="space-y-8">
  <!-- Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="card">
      <div class="text-3xl font-bold text-white mb-1">{stats.tournaments}</div>
      <div class="text-sm text-gray-500">Torneos</div>
    </div>
    <div class="card">
      <div class="text-3xl font-bold text-white mb-1">{stats.players}</div>
      <div class="text-sm text-gray-500">Jugadores</div>
    </div>
    <div class="card">
      <div class="text-3xl font-bold text-white mb-1">{stats.matches}</div>
      <div class="text-sm text-gray-500">Enfrentamientos</div>
    </div>
  </div>

  <!-- Quick links -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <a href="/admin/tournaments?create=1" class="card-hover text-center py-6">
      <div class="text-2xl mb-2">🏆</div>
      <div class="text-sm font-medium text-gray-300">Nuevo Torneo</div>
    </a>
    <a href="/admin/players?create=1" class="card-hover text-center py-6">
      <div class="text-2xl mb-2">👤</div>
      <div class="text-sm font-medium text-gray-300">Nuevo Jugador</div>
    </a>
    <a href="/admin/matches?create=1" class="card-hover text-center py-6">
      <div class="text-2xl mb-2">⚔</div>
      <div class="text-sm font-medium text-gray-300">Nuevo Combate</div>
    </a>
    <a href="/admin/news?create=1" class="card-hover text-center py-6">
      <div class="text-2xl mb-2">📢</div>
      <div class="text-sm font-medium text-gray-300">Nueva Noticia</div>
    </a>
  </div>

  <!-- Recent Matches -->
  {#if recentMatches.length > 0}
    <section>
      <h2 class="text-lg font-bold text-white mb-4">Actividad reciente</h2>
      <div class="space-y-2">
        {#each recentMatches as match}
          <div class="card py-3 flex items-center justify-between">
            <div class="text-sm text-gray-300">
              <span class="font-semibold">{match.player1.name}</span>
              <span class="text-gray-600 mx-2">vs</span>
              <span class="font-semibold">{match.player2.name}</span>
              <span class="text-gray-500 ml-2">&mdash; {match.tournament.name}</span>
            </div>
            <span class={match.status === 'completed' ? 'badge-completed' : 'badge-scheduled'}>
              {match.status === 'completed' ? 'Completado' : 'Programado'}
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
