<script lang="ts">
  let { data } = $props();
  const { tournament, standings } = data;

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function formatDateTime(d: string | Date) {
    const date = new Date(d);
    return {
      date: date.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  const completedMatches = $derived(tournament.matches.filter((m: { status: string }) => m.status === 'completed'));
  const scheduledMatches = $derived(tournament.matches.filter((m: { status: string }) => m.status === 'scheduled'));
</script>

<svelte:head>
  <title>{tournament.name} &mdash; Cobbleverse</title>
</svelte:head>

<!-- Header Banner -->
<div class="bg-gradient-to-b from-poke-surface to-poke-darker border-b border-poke-border">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <a href="/" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
      ← Volver al inicio
    </a>
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-3">
          <span class="bg-poke-accent/20 text-poke-accent text-xs font-semibold px-3 py-1 rounded-full border border-poke-accent/30">
            {tournament.format}
          </span>
          {#if tournament.active}
            <span class="badge-online">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Activo
            </span>
          {:else}
            <span class="badge-offline">Finalizado</span>
          {/if}
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
        <p class="text-gray-400">{tournament.description}</p>
      </div>
      <div class="text-right flex-shrink-0">
        <div class="text-xs text-gray-500 mb-1">Fecha de inicio</div>
        <div class="text-sm font-medium text-gray-300 capitalize">{formatDate(tournament.startDate)}</div>
      </div>
    </div>
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

    <!-- Left column: Rules & Participants -->
    <div class="space-y-8">

      <!-- Rules -->
      <section class="card">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-poke-accent">📜</span> Reglamento
        </h2>
        <div class="prose prose-invert prose-sm max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap">
          {tournament.rules}
        </div>
      </section>

      <!-- Participants -->
      <section class="card">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-poke-blue">👥</span>
          Participantes
          <span class="ml-auto text-sm text-gray-500 font-normal">{tournament.players.length}</span>
        </h2>
        {#if tournament.players.length === 0}
          <p class="text-sm text-gray-500 italic">Sin participantes aún.</p>
        {:else}
          <ul class="space-y-2">
            {#each tournament.players as tp, i}
              <li class="flex items-center gap-3 py-1.5">
                <span class="w-6 h-6 bg-poke-surface2 border border-poke-border rounded-full flex items-center justify-center text-xs text-gray-500 font-mono flex-shrink-0">
                  {i + 1}
                </span>
                <span class="text-gray-200 font-medium">{tp.player.name}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

    </div>

    <!-- Right column: Standings & Matches -->
    <div class="lg:col-span-2 space-y-8">

      <!-- Standings -->
      <section>
        <h2 class="section-title">
          <span class="text-poke-gold">🥇</span>
          Tabla de Posiciones
        </h2>
        {#if standings.length === 0}
          <div class="card text-center py-8">
            <p class="text-gray-500 text-sm">No hay datos de posiciones aún.</p>
          </div>
        {:else}
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th class="w-10">#</th>
                  <th>Jugador</th>
                  <th class="text-center w-16">PJ</th>
                  <th class="text-center w-16">W</th>
                  <th class="text-center w-16">L</th>
                  <th class="text-center w-20">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {#each standings as row, i}
                  <tr class={i === 0 && row.points > 0 ? 'bg-poke-gold/5' : ''}>
                    <td class="text-center text-gray-500 font-mono text-xs">
                      {#if i === 0 && row.points > 0}
                        <span class="text-poke-gold">🥇</span>
                      {:else if i === 1 && row.points > 0}
                        <span class="text-gray-400">🥈</span>
                      {:else if i === 2 && row.points > 0}
                        <span class="text-amber-700">🥉</span>
                      {:else}
                        {i + 1}
                      {/if}
                    </td>
                    <td class="font-semibold text-white">{row.player.name}</td>
                    <td class="text-center text-gray-400">{row.played}</td>
                    <td class="text-center text-emerald-400 font-semibold">{row.wins}</td>
                    <td class="text-center text-red-400">{row.losses}</td>
                    <td class="text-center">
                      <span class="font-bold text-lg {i === 0 && row.points > 0 ? 'text-poke-gold' : 'text-white'}">
                        {row.points}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="text-xs text-gray-600 mt-2">Victoria = 3 pts &bull; Derrota = 0 pts</p>
        {/if}
      </section>

      <!-- Upcoming Matches -->
      {#if scheduledMatches.length > 0}
        <section>
          <h2 class="section-title">
            <span class="text-poke-blue">⚔</span>
            Próximos Combates
          </h2>
          <div class="space-y-2">
            {#each scheduledMatches as match}
              {@const dt = formatDateTime(match.scheduledAt)}
              <div class="card py-4 flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="flex-shrink-0 text-center bg-poke-surface2 border border-poke-border rounded-lg px-3 py-2 min-w-[60px]">
                    <div class="text-xs text-gray-500">{dt.date}</div>
                    <div class="text-sm font-bold text-white">{dt.time}</div>
                  </div>
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <span class="font-semibold text-white truncate">{match.player1.name}</span>
                    <span class="text-xs font-bold text-gray-500 flex-shrink-0">VS</span>
                    <span class="font-semibold text-white truncate">{match.player2.name}</span>
                  </div>
                </div>
                <span class="badge-scheduled flex-shrink-0">Programado</span>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Completed Matches -->
      {#if completedMatches.length > 0}
        <section>
          <h2 class="section-title">
            <span class="text-gray-500">✓</span>
            Resultados
          </h2>
          <div class="space-y-2">
            {#each completedMatches as match}
              {@const dt = formatDateTime(match.scheduledAt)}
              <div class="card py-4 flex items-center justify-between gap-4 opacity-80">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="flex-shrink-0 text-center bg-poke-surface2 border border-poke-border rounded-lg px-3 py-2 min-w-[60px]">
                    <div class="text-xs text-gray-500">{dt.date}</div>
                    <div class="text-sm font-bold text-gray-400">{dt.time}</div>
                  </div>
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <span class="font-semibold truncate {match.winner?.id === match.player1.id ? 'text-emerald-400' : 'text-gray-500 line-through decoration-gray-600'}">{match.player1.name}</span>
                    <span class="text-xs font-bold text-gray-600 flex-shrink-0">VS</span>
                    <span class="font-semibold truncate {match.winner?.id === match.player2.id ? 'text-emerald-400' : 'text-gray-500 line-through decoration-gray-600'}">{match.player2.name}</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1 flex-shrink-0">
                  {#if match.winner}
                    <span class="text-xs text-emerald-400 font-semibold">+{match.winner.name}</span>
                  {/if}
                  <span class="badge-completed">Completado</span>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

    </div>
  </div>

</div>
