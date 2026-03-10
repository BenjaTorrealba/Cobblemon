<script lang="ts">
  let { data } = $props();

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  }
</script>

<svelte:head><title>Torneos &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
  <div class="mb-10">
    <h1 class="text-3xl font-bold text-white mb-2">Torneos</h1>
    <p class="text-gray-500">Todos los torneos de BenjaVerse.</p>
  </div>

  {#if data.tournaments.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">🏆</div>
      <p>Todavía no hay torneos creados.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each data.tournaments as t}
        <a
          href="/tournaments/{t.id}"
          class="card bg-poke-surface2 hover:border-poke-accent/50 transition-colors group flex flex-col sm:flex-row sm:items-center gap-4 block"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap mb-1">
              <h2 class="font-bold text-white group-hover:text-poke-accent transition-colors text-lg">{t.name}</h2>
              {#if t.active}
                <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/40 text-green-400">Activo</span>
              {:else}
                <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-500/15 border border-gray-600 text-gray-500">Finalizado</span>
              {/if}
            </div>
            {#if t.description}
              <p class="text-sm text-gray-500 line-clamp-2">{t.description}</p>
            {/if}
            <p class="text-xs text-gray-600 mt-2">📅 {formatDate(t.startDate)} · Formato: {t.format}</p>
          </div>
          <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 flex-shrink-0 text-sm text-gray-400">
            <span title="Inscritos">👥 {t._count.userEntries} jugadores</span>
            <span title="Partidas">⚔️ {t._count.matches} partidas</span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
