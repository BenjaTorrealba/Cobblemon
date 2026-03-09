<script lang="ts">
  let { data } = $props();
  const { item } = data;

  const CATEGORIES: Record<string, { label: string; color: string }> = {
    general:    { label: 'General',       color: 'bg-gray-700/50 text-gray-300 border-gray-600' },
    tournament: { label: 'Torneo',        color: 'bg-poke-gold/20 text-poke-gold border-poke-gold/40' },
    update:     { label: 'Actualización', color: 'bg-poke-accent/20 text-poke-accent border-poke-accent/40' },
  };

  const cat = CATEGORIES[item.category] ?? CATEGORIES.general;

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // Parse content lines into blocks
  interface Block { type: 'h2' | 'h3' | 'p' | 'gap'; text: string }
  function parseContent(text: string): Block[] {
    return text.split('\n').map((line): Block => {
      if (line.startsWith('## '))  return { type: 'h2', text: line.slice(3) };
      if (line.startsWith('### ')) return { type: 'h3', text: line.slice(4) };
      if (line.trim() === '')      return { type: 'gap', text: '' };
      return { type: 'p', text: line };
    });
  }

  const blocks = parseContent(item.content);
</script>

<svelte:head>
  <title>{item.title} &mdash; BenjaVerse</title>
</svelte:head>

<!-- Header -->
<div class="bg-gradient-to-b from-poke-surface to-poke-darker border-b border-poke-border">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <a href="/news" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
      ← Volver a noticias
    </a>
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <span class="text-xs font-semibold px-2.5 py-1 rounded-full border {cat.color}">{cat.label}</span>
      <span class="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
    </div>
    <h1 class="text-3xl sm:text-4xl font-bold text-white leading-snug">{item.title}</h1>
  </div>
</div>

<!-- Body -->
<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
  <div class="space-y-3 text-gray-300 leading-relaxed">
    {#each blocks as block}
      {#if block.type === 'h2'}
        <h2 class="text-2xl font-bold text-white mt-8 mb-1">{block.text}</h2>
      {:else if block.type === 'h3'}
        <h3 class="text-lg font-semibold text-gray-200 mt-5 mb-0.5">{block.text}</h3>
      {:else if block.type === 'gap'}
        <div class="h-2"></div>
      {:else}
        <p>{block.text}</p>
      {/if}
    {/each}
  </div>
</div>
