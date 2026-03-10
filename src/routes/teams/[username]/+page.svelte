<script lang="ts">
  import { untrack } from 'svelte';
  let { data } = $props();

  const EMOJIS = ['❤️', '😂', '🔥', '👏', '😮', '😢', '👀', '💯'];

  interface Comment { id: number; content: string; createdAt: string | Date; author: { username: string } }
  interface Reaction { id: number; userId: number; emoji: string }
  interface Team {
    id: number; name: string; description: string;
    pokemons: { pokemonId: number; pokemonName: string; shiny: boolean; item: string; ability: string; move1: string; move2: string; move3: string; move4: string }[];
    comments: Comment[];
    reactions: Reaction[];
  }

  // Local reactive state for each team
  let teamStates = $state(
    untrack(() => (data.teams as Team[]).map(t => ({
      id: t.id,
      comments: [...t.comments],
      reactions: [...t.reactions],
      commentInput: '',
      postingComment: false,
    })))
  );

  const spriteUrl = (id: number, shiny = false) =>
    shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  function getState(teamId: number) {
    return teamStates.find(s => s.id === teamId)!;
  }

  function reactionCount(reactions: Reaction[], emoji: string) {
    return reactions.filter(r => r.emoji === emoji).length;
  }

  function myReaction(reactions: Reaction[], emoji: string): boolean {
    if (!data.currentUser) return false;
    return reactions.some(r => r.emoji === emoji && r.userId === data.currentUser!.id);
  }

  async function toggleReaction(teamId: number, emoji: string) {
    if (!data.currentUser) return;
    const state = getState(teamId);
    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, emoji }),
    });
    if (!res.ok) return;
    const body = await res.json();
    if (body.action === 'removed') {
      state.reactions = state.reactions.filter(
        r => !(r.userId === data.currentUser!.id && r.emoji === emoji)
      );
    } else {
      state.reactions = [...state.reactions, { id: Date.now(), userId: data.currentUser.id, emoji }];
    }
  }

  async function postComment(teamId: number) {
    const state = getState(teamId);
    if (!state.commentInput.trim() || !data.currentUser) return;
    state.postingComment = true;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, content: state.commentInput.trim() }),
    });
    if (res.ok) {
      const comment = await res.json();
      state.comments = [...state.comments, comment];
      state.commentInput = '';
    }
    state.postingComment = false;
  }

  async function deleteComment(teamId: number, commentId: number) {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) {
      const state = getState(teamId);
      state.comments = state.comments.filter(c => c.id !== commentId);
    }
  }

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:head><title>Equipos de @{data.username} &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <a href="/teams" class="text-xs text-gray-500 hover:text-gray-300 mb-6 inline-block">← Todos los equipos</a>

  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white">
      Equipos de <a href="/profile/{data.username}" class="text-poke-accent hover:underline">@{data.username}</a>
    </h1>
    <p class="text-sm text-gray-500 mt-1">{data.teams.length} equipo{data.teams.length !== 1 ? 's' : ''} publicado{data.teams.length !== 1 ? 's' : ''}</p>
  </div>

  <div class="space-y-12">
    {#each data.teams as team, ti}
      {@const state = teamStates[ti]}
      <div class="space-y-4">
        <div>
          <h2 class="text-xl font-bold text-white">{team.name}</h2>
          {#if team.description}
            <p class="text-gray-400 text-sm mt-1">{team.description}</p>
          {/if}
        </div>

        {#if team.pokemons.length === 0}
          <div class="text-center py-8 text-gray-600 border border-poke-border rounded-xl">
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
            {@const count = reactionCount(state.reactions, emoji)}
            {@const mine = myReaction(state.reactions, emoji)}
            <button
              onclick={() => toggleReaction(team.id, emoji)}
              disabled={!data.currentUser}
              class="flex items-center gap-1 px-2.5 py-1 rounded-full border text-sm transition-colors
                {mine
                  ? 'bg-poke-accent/20 border-poke-accent/60 text-white'
                  : 'bg-poke-surface border-poke-border text-gray-400 hover:border-poke-accent/40 disabled:opacity-50 disabled:cursor-default'}"
            >
              <span>{emoji}</span>
              {#if count > 0}<span class="text-xs font-semibold">{count}</span>{/if}
            </button>
          {/each}
          {#if !data.currentUser}
            <span class="text-xs text-gray-600 ml-1">Iniciá sesión para reaccionar</span>
          {/if}
        </div>

        <!-- Comments -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Comentarios ({state.comments.length})
          </h3>

          {#each state.comments as comment}
            <div class="card bg-poke-surface py-3 px-4 flex gap-3">
              <a href="/profile/{comment.author.username}" class="text-poke-accent text-sm font-semibold flex-shrink-0 hover:underline">
                @{comment.author.username}
              </a>
              <div class="flex-1 min-w-0">
                <p class="text-gray-300 text-sm break-words">{comment.content}</p>
                <p class="text-xs text-gray-600 mt-1">{formatDate(comment.createdAt)}</p>
              </div>
              {#if data.currentUser?.username === comment.author.username}
                <button
                  onclick={() => deleteComment(team.id, comment.id)}
                  class="text-gray-600 hover:text-red-400 text-xs flex-shrink-0 transition-colors"
                  title="Eliminar"
                >✕</button>
              {/if}
            </div>
          {/each}

          {#if data.currentUser}
            <div class="flex gap-2">
              <input
                type="text"
                class="input flex-1 text-sm"
                placeholder="Escribí un comentario..."
                bind:value={state.commentInput}
                onkeydown={(e) => e.key === 'Enter' && postComment(team.id)}
                maxlength="1000"
              />
              <button
                class="btn text-sm px-4"
                onclick={() => postComment(team.id)}
                disabled={state.postingComment || !state.commentInput.trim()}
              >
                {state.postingComment ? '...' : 'Enviar'}
              </button>
            </div>
          {:else}
            <p class="text-xs text-gray-600"><a href="/login" class="text-poke-accent hover:underline">Iniciá sesión</a> para comentar.</p>
          {/if}
        </div>

        {#if ti < data.teams.length - 1}
          <hr class="border-poke-border" />
        {/if}
      </div>
    {/each}
  </div>
</div>
