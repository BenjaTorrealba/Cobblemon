<script lang="ts">
  import { untrack } from 'svelte';
  let { data } = $props();

  const EMOJIS = ['❤️', '😂', '🔥', '👏', '😮', '😢', '👀', '💯'];

  interface Comment { id: number; content: string; createdAt: string | Date; author: { username: string } }
  interface Reaction { id: number; userId: number; emoji: string }

  let comments   = $state<Comment[]>(untrack(() => data.team.comments));
  let reactions  = $state<Reaction[]>(untrack(() => data.team.reactions));
  let commentInput = $state('');
  let posting = $state(false);

  const currentUser = $derived(data.currentUser);
  const team = $derived(data.team);

  const spriteUrl = (id: number, shiny = false) =>
    shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  function reactionCount(emoji: string) {
    return reactions.filter(r => r.emoji === emoji).length;
  }

  function myReaction(emoji: string): boolean {
    if (!currentUser) return false;
    return reactions.some(r => r.emoji === emoji && r.userId === currentUser.id);
  }

  async function toggleReaction(emoji: string) {
    if (!currentUser) return;
    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: team.id, emoji }),
    });
    if (!res.ok) return;
    const body = await res.json();
    if (body.action === 'removed') {
      reactions = reactions.filter(r => !(r.userId === currentUser.id && r.emoji === emoji));
    } else {
      reactions = [...reactions, { id: Date.now(), userId: currentUser.id, emoji }];
    }
  }

  async function postComment() {
    if (!commentInput.trim() || !currentUser) return;
    posting = true;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: team.id, content: commentInput.trim() }),
    });
    if (res.ok) {
      const c = await res.json();
      comments = [...comments, c];
      commentInput = '';
    }
    posting = false;
  }

  async function deleteComment(commentId: number) {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) comments = comments.filter(c => c.id !== commentId);
  }

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:head><title>{team.name} — @{data.username} &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12 space-y-10">
  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 text-sm text-gray-500">
    <a href="/teams" class="hover:text-gray-300 transition-colors">Equipos</a>
    <span>/</span>
    <a href="/teams/{data.username}" class="hover:text-gray-300 transition-colors">@{data.username}</a>
    <span>/</span>
    <span class="text-white">{team.name}</span>
  </div>

  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold text-white">{team.name}</h1>
    {#if team.description}
      <p class="text-gray-400 mt-2">{team.description}</p>
    {/if}
    <p class="text-sm text-gray-600 mt-1">
      por <a href="/profile/{data.username}" class="text-poke-accent hover:underline">@{data.username}</a>
    </p>
  </div>

  <!-- Pokemon grid -->
  {#if team.pokemons.length === 0}
    <div class="text-center py-16 text-gray-600 border border-poke-border rounded-xl">
      <p>Este equipo todavía no tiene Pokémon configurados.</p>
    </div>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each team.pokemons as p}
        <div class="card bg-poke-surface2 text-center">
          <div class="relative w-24 h-24 mx-auto">
            <img
              src={spriteUrl(p.pokemonId, p.shiny)}
              alt={p.pokemonName}
              class="w-24 h-24 object-contain rounded-xl border border-poke-border {p.shiny ? 'border-poke-gold/60 bg-poke-gold/5' : ''}"
            />
            {#if p.shiny}<span class="absolute -top-1 -right-1 text-xs">✨</span>{/if}
          </div>
          <h3 class="font-bold text-white capitalize mt-2">{p.pokemonName}</h3>
          {#if p.item}
            <div class="flex items-center justify-center gap-1 mt-1">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${p.item.toLowerCase().replace(/ /g, '-')}.png`}
                alt={p.item}
                class="w-6 h-6 object-contain"
                onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
              <span class="text-xs text-gray-500">{p.item}</span>
            </div>
          {/if}
          {#if p.ability}
            <p class="text-xs text-poke-accent capitalize mt-0.5">{p.ability.replace(/-/g, ' ')}</p>
          {/if}
          <div class="mt-3 grid grid-cols-2 gap-1 text-xs">
            {#each [p.move1, p.move2, p.move3, p.move4] as move}
              {#if move}
                <span class="bg-poke-surface px-2 py-1 rounded border border-poke-border capitalize">{move}</span>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Reactions -->
  <div class="flex flex-wrap gap-2 items-center">
    {#each EMOJIS as emoji}
      {@const count = reactionCount(emoji)}
      {@const mine = myReaction(emoji)}
      <button
        onclick={() => toggleReaction(emoji)}
        disabled={!currentUser}
        class="flex items-center gap-1 px-2.5 py-1 rounded-full border text-sm transition-colors
          {mine
            ? 'bg-poke-accent/20 border-poke-accent/60 text-white'
            : 'bg-poke-surface border-poke-border text-gray-400 hover:border-poke-accent/40 disabled:opacity-50 disabled:cursor-default'}"
      >
        <span>{emoji}</span>
        {#if count > 0}<span class="text-xs font-semibold">{count}</span>{/if}
      </button>
    {/each}
    {#if !currentUser}
      <span class="text-xs text-gray-600 ml-1">Iniciá sesión para reaccionar</span>
    {/if}
  </div>

  <!-- Comments -->
  <div class="space-y-3">
    <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">
      Comentarios ({comments.length})
    </h2>

    {#each comments as comment}
      <div class="card bg-poke-surface py-3 px-4 flex gap-3">
        <a href="/profile/{comment.author.username}" class="text-poke-accent text-sm font-semibold flex-shrink-0 hover:underline">
          @{comment.author.username}
        </a>
        <div class="flex-1 min-w-0">
          <p class="text-gray-300 text-sm break-words">{comment.content}</p>
          <p class="text-xs text-gray-600 mt-1">{formatDate(comment.createdAt)}</p>
        </div>
        {#if currentUser?.username === comment.author.username}
          <button
            onclick={() => deleteComment(comment.id)}
            class="text-gray-600 hover:text-red-400 text-xs flex-shrink-0 transition-colors"
            title="Eliminar"
          >✕</button>
        {/if}
      </div>
    {/each}

    {#if currentUser}
      <div class="flex gap-2">
        <input
          type="text"
          class="input flex-1 text-sm"
          placeholder="Escribí un comentario..."
          bind:value={commentInput}
          onkeydown={(e) => e.key === 'Enter' && postComment()}
          maxlength="1000"
        />
        <button
          class="btn text-sm px-4"
          onclick={postComment}
          disabled={posting || !commentInput.trim()}
        >
          {posting ? '...' : 'Enviar'}
        </button>
      </div>
    {:else}
      <p class="text-xs text-gray-600"><a href="/login" class="text-poke-accent hover:underline">Iniciá sesión</a> para comentar.</p>
    {/if}
  </div>
</div>
