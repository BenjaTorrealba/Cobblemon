<script lang="ts">
  let { data } = $props();

  const CATEGORIES: Record<string, { label: string; color: string }> = {
    general:    { label: 'General',       color: 'bg-gray-700/50 text-gray-300 border-gray-600' },
    tournament: { label: 'Torneo',        color: 'bg-poke-gold/20 text-poke-gold border-poke-gold/40' },
    update:     { label: 'Actualización', color: 'bg-poke-accent/20 text-poke-accent border-poke-accent/40' },
  };

  let activeFilter = $state('all');

  const filtered = $derived(
    activeFilter === 'all'
      ? data.news
      : data.news.filter((n: { category: string }) => n.category === activeFilter)
  );

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  function timeAgo(d: string | Date) {
    const diff = Date.now() - new Date(d).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Ahora mismo';
    if (mins < 60)  return `hace ${mins}m`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7)   return `hace ${days}d`;
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Noticias &mdash; Cobbleverse</title>
</svelte:head>

<!-- Header -->
<div class="bg-gradient-to-b from-poke-surface to-poke-darker border-b border-poke-border">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <a href="/" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
      ← Volver al inicio
    </a>
    <div class="flex items-center gap-4 mb-2">
      <span class="text-3xl">📢</span>
      <h1 class="text-3xl font-bold text-white">Noticias y Anuncios</h1>
    </div>
    <p class="text-gray-400 ml-14">Actualizaciones, nuevos torneos y todo lo que pasa en Cobbleverse.</p>
  </div>
</div>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

  <!-- Filters -->
  <div class="flex items-center gap-2 mb-8 flex-wrap">
    {#each [['all', 'Todos'], ['general', 'General'], ['tournament', 'Torneos'], ['update', 'Actualizaciones']] as [val, lbl]}
      <button
        onclick={() => activeFilter = val}
        class="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
        {activeFilter === val
          ? 'bg-poke-accent text-white border-poke-accent'
          : 'bg-transparent text-gray-400 border-poke-border hover:border-poke-accent/50 hover:text-gray-200'}"
      >
        {lbl}
      </button>
    {/each}
  </div>

  {#if filtered.length === 0}
    <div class="card text-center py-16">
      <p class="text-4xl mb-4">📭</p>
      <p class="text-gray-500">No hay anuncios publicados aún.</p>
      <a href="/" class="inline-block mt-4 text-sm text-poke-accent hover:underline">Volver al inicio</a>
    </div>
  {:else}
    <div class="space-y-6">
      {#each filtered as item, i}
        {@const cat = CATEGORIES[item.category] ?? CATEGORIES.general}
        <article class="card group {i === 0 ? 'border-poke-accent/30 bg-gradient-to-br from-poke-surface to-poke-surface2' : ''}">
          <!-- Top row -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full border {cat.color}">
                {cat.label}
              </span>
              {#if i === 0}
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full border bg-poke-accent/10 text-poke-accent border-poke-accent/30">
                  Último
                </span>
              {/if}
            </div>
            <div class="flex-shrink-0 text-right">
              <div class="text-xs text-gray-500">{timeAgo(item.createdAt)}</div>
              <div class="text-xs text-gray-600 capitalize mt-0.5">{formatDate(item.createdAt)}</div>
            </div>
          </div>

          <!-- Title -->
          <h2 class="text-xl font-bold text-white mb-3 leading-snug">{item.title}</h2>

          <!-- Content -->
          <p class="text-gray-300 leading-relaxed whitespace-pre-line">{item.content}</p>
        </article>
      {/each}
    </div>
  {/if}

</div>
