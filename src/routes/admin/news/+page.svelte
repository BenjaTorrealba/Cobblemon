<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';

  let { data } = $props();

  let showModal = $state($page.url.searchParams.get('create') === '1');
  let editingItem = $state<typeof data.news[0] | null>(null);

  let form = $state({ title: '', content: '', category: 'general', published: true });
  let saving = $state(false);
  let error = $state('');
  let contentTextarea: HTMLTextAreaElement;

  function insertAtCursor(prefix: string) {
    const el = contentTextarea;
    if (!el) return;
    const start = el.selectionStart;
    const before = form.content.slice(0, start);
    const after  = form.content.slice(start);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    form.content = before + (needsNewline ? '\n' : '') + prefix + after;
  }

  const CATEGORIES = [
    { value: 'general',    label: 'General' },
    { value: 'tournament', label: 'Torneo' },
    { value: 'update',     label: 'Actualización' },
  ];

  const CATEGORY_COLORS: Record<string, string> = {
    general:    'text-gray-300 border-gray-600 bg-gray-700/40',
    tournament: 'text-poke-gold border-poke-gold/40 bg-poke-gold/10',
    update:     'text-poke-accent border-poke-accent/40 bg-poke-accent/10',
  };

  function openCreate() {
    editingItem = null;
    form = { title: '', content: '', category: 'general', published: true };
    error = '';
    showModal = true;
  }

  function openEdit(item: typeof data.news[0]) {
    editingItem = item;
    form = { title: item.title, content: item.content, category: item.category, published: item.published };
    error = '';
    showModal = true;
  }

  async function save() {
    error = '';
    if (!form.title.trim() || !form.content.trim()) {
      error = 'Título y contenido son obligatorios.';
      return;
    }
    saving = true;
    const url = editingItem ? `/api/news/${editingItem.id}` : '/api/news';
    const method = editingItem ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    saving = false;
    if (res.ok) {
      showModal = false;
      invalidateAll();
    } else {
      const d = await res.json();
      error = d.error ?? 'Error al guardar';
    }
  }

  async function togglePublished(item: typeof data.news[0]) {
    await fetch(`/api/news/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !item.published }),
    });
    invalidateAll();
  }

  async function deleteItem(id: number, title: string) {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    await fetch(`/api/news/${id}`, { method: 'DELETE' });
    invalidateAll();
  }

  function timeAgo(d: string | Date) {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Noticias &mdash; Admin Cobbleverse</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-white">Noticias ({data.news.length})</h2>
    <button onclick={openCreate} class="btn-primary">+ Nueva noticia</button>
  </div>

  {#if data.news.length === 0}
    <div class="card text-center py-12 text-gray-500">No hay noticias aún.</div>
  {:else}
    <div class="space-y-3">
      {#each data.news as item}
        <div class="card flex flex-col sm:flex-row sm:items-start justify-between gap-4 {!item.published ? 'opacity-60' : ''}">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full border {CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.general}">
                {CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}
              </span>
              {#if !item.published}
                <span class="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">Borrador</span>
              {/if}
              <span class="text-xs text-gray-600">{timeAgo(item.createdAt)}</span>
            </div>
            <h3 class="font-bold text-white mb-1">{item.title}</h3>
            <p class="text-sm text-gray-400 line-clamp-2 whitespace-pre-line">{item.content}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <button
              onclick={() => togglePublished(item)}
              class="text-xs px-3 py-1.5 rounded-lg border transition-colors
              {item.published
                ? 'border-gray-600 text-gray-400 hover:border-red-600 hover:text-red-400'
                : 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/20'}"
            >
              {item.published ? '⤓ Despublicar' : '↑ Publicar'}
            </button>
            <button onclick={() => openEdit(item)} class="btn-secondary text-xs py-1.5 px-3">✏ Editar</button>
            <button onclick={() => deleteItem(item.id, item.title)} class="btn-danger text-xs py-1.5 px-3">🗑</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-poke-surface border border-poke-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-poke-border flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">{editingItem ? 'Editar noticia' : 'Nueva noticia'}</h3>
        <button onclick={() => showModal = false} class="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        {#if error}
          <div class="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
        {/if}

        <div>
          <label class="label" for="n-title">Título</label>
          <input id="n-title" type="text" bind:value={form.title} class="input" placeholder="Ej: ¡Nuevo torneo anunciado!" />
        </div>

        <div>
          <label class="label" for="n-category">Categoría</label>
          <select id="n-category" bind:value={form.category} class="input">
            {#each CATEGORIES as cat}
              <option value={cat.value}>{cat.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="label" for="n-content">Contenido</label>
          <div class="flex gap-2 mb-1.5">
            <button type="button" onclick={() => insertAtCursor('## ')}
              class="text-xs px-2.5 py-1 rounded border border-poke-border text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              H2 Título
            </button>
            <button type="button" onclick={() => insertAtCursor('### ')}
              class="text-xs px-2.5 py-1 rounded border border-poke-border text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              H3 Subtítulo
            </button>
          </div>
          <textarea
            id="n-content"
            bind:value={form.content}
            bind:this={contentTextarea}
            class="input resize-none h-52 font-mono text-sm"
            placeholder="Escribe el contenido aquí...&#10;&#10;## Usa ## para títulos&#10;### Usa ### para subtítulos&#10;Texto normal para párrafos."
          ></textarea>
          <p class="text-xs text-gray-600 mt-1">Usa <code class="text-gray-500">## Título</code> y <code class="text-gray-500">### Subtítulo</code> al inicio de una línea.</p>
        </div>

        <div class="flex items-center gap-3">
          <input type="checkbox" id="n-published" bind:checked={form.published} class="w-4 h-4 accent-poke-accent" />
          <label for="n-published" class="text-sm text-gray-300">Publicar inmediatamente</label>
        </div>
      </div>
      <div class="p-6 border-t border-poke-border flex gap-3 justify-end">
        <button onclick={() => showModal = false} class="btn-secondary">Cancelar</button>
        <button onclick={save} disabled={saving} class="btn-primary">
          {#if saving}
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          {/if}
          {editingItem ? 'Guardar cambios' : 'Publicar'}
        </button>
      </div>
    </div>
  </div>
{/if}
