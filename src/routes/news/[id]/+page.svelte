<script lang="ts">
  import { untrack } from 'svelte';
  let { data } = $props();
  const item = $derived(data.item);
  const currentUser = $derived(data.currentUser);

  const EMOJIS = ['❤️', '😂', '🔥', '👏', '😮', '😢', '👀', '💯'];

  interface Comment { id: number; content: string; createdAt: string | Date; author: { username: string } }
  interface Reaction { id: number; userId: number; emoji: string }

  let comments = $state<Comment[]>(untrack(() => [...(data.item.comments ?? [])]));
  let reactions = $state<Reaction[]>(untrack(() => [...(data.item.reactions ?? [])]));
  let commentInput = $state('');
  let postingComment = $state(false);

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
      body: JSON.stringify({ newsId: item.id, emoji }),
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
    postingComment = true;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId: item.id, content: commentInput.trim() }),
    });
    if (res.ok) {
      const comment = await res.json();
      comments = [...comments, comment];
      commentInput = '';
    }
    postingComment = false;
  }

  async function deleteComment(commentId: number) {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) comments = comments.filter(c => c.id !== commentId);
  }

  const CATEGORIES: Record<string, { label: string; color: string }> = {
    general:    { label: 'General',       color: 'bg-gray-700/50 text-gray-300 border-gray-600' },
    tournament: { label: 'Torneo',        color: 'bg-poke-gold/20 text-poke-gold border-poke-gold/40' },
    update:     { label: 'Actualización', color: 'bg-poke-accent/20 text-poke-accent border-poke-accent/40' },
  };

  const cat = $derived(CATEGORIES[item.category] ?? CATEGORIES.general);

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }
  function formatShort(d: string | Date) {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
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

  const blocks = $derived(parseContent(item.content));
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

  <!-- Reactions -->
  <div class="mt-10 pt-6 border-t border-poke-border">
    <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Reacciones</h3>
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
  </div>

  <!-- Comments -->
  <div class="mt-8 space-y-4">
    <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">
      Comentarios ({comments.length})
    </h3>

    {#each comments as comment}
      <div class="card bg-poke-surface py-3 px-4 flex gap-3">
        <a href="/profile/{comment.author.username}" class="text-poke-accent text-sm font-semibold flex-shrink-0 hover:underline">
          @{comment.author.username}
        </a>
        <div class="flex-1 min-w-0">
          <p class="text-gray-300 text-sm break-words">{comment.content}</p>
          <p class="text-xs text-gray-600 mt-1">{formatShort(comment.createdAt)}</p>
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
          disabled={postingComment || !commentInput.trim()}
        >
          {postingComment ? '...' : 'Enviar'}
        </button>
      </div>
    {:else}
      <p class="text-xs text-gray-600"><a href="/login" class="text-poke-accent hover:underline">Iniciá sesión</a> para comentar.</p>
    {/if}
  </div>
</div>
