<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let posts = $state<any[]>(data.posts);
  let newPostContent = $state('');
  let posting = $state(false);
  let nextCursor = $state<number | null>(data.posts.length === 20 ? (data.posts.at(-1)?.id ?? null) : null);
  let loadingMore = $state(false);

  // Comment input state per post
  let commentTexts = $state<Record<number, string>>({});
  let showComments = $state<Record<number, boolean>>({});
  let submittingComment = $state<Record<number, boolean>>({});

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
  }

  function myLike(post: any) {
    return data.user ? post.likes.some((l: any) => l.userId === data.user!.id) : false;
  }

  async function submitPost() {
    if (!newPostContent.trim() || posting) return;
    posting = true;
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPostContent.trim() }),
    });
    if (res.ok) {
      const post = await res.json();
      posts = [post, ...posts];
      newPostContent = '';
      await invalidateAll();
    }
    posting = false;
  }

  async function toggleLike(post: any) {
    if (!data.user) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
    if (res.ok) {
      const { liked, count } = await res.json();
      posts = posts.map(p =>
        p.id === post.id
          ? {
              ...p,
              likes: liked
                ? [...p.likes, { userId: data.user!.id }]
                : p.likes.filter((l: any) => l.userId !== data.user!.id),
            }
          : p
      );
    }
  }

  async function submitComment(post: any) {
    const content = (commentTexts[post.id] ?? '').trim();
    if (!content || submittingComment[post.id]) return;
    submittingComment = { ...submittingComment, [post.id]: true };
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const comment = await res.json();
      posts = posts.map(p =>
        p.id === post.id ? { ...p, comments: [...p.comments, comment] } : p
      );
      commentTexts = { ...commentTexts, [post.id]: '' };
    }
    submittingComment = { ...submittingComment, [post.id]: false };
  }

  async function deleteComment(post: any, cid: number) {
    const res = await fetch(`/api/posts/${post.id}/comments?cid=${cid}`, { method: 'DELETE' });
    if (res.ok) {
      posts = posts.map(p =>
        p.id === post.id ? { ...p, comments: p.comments.filter((c: any) => c.id !== cid) } : p
      );
    }
  }

  async function deletePost(postId: number) {
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    if (res.ok) posts = posts.filter(p => p.id !== postId);
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    loadingMore = true;
    const res = await fetch(`/api/posts?cursor=${nextCursor}`);
    if (res.ok) {
      const { posts: more, next } = await res.json();
      posts = [...posts, ...more];
      nextCursor = next;
    }
    loadingMore = false;
  }

  function handleKeydown(e: KeyboardEvent, post?: any) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (post) submitComment(post);
      else submitPost();
    }
  }
</script>

<div class="max-w-2xl mx-auto px-4 py-10">
  <h1 class="text-2xl font-display text-white mb-8">Muro</h1>

  <!-- Post composer -->
  {#if data.user}
    <div class="bg-poke-surface border border-poke-border rounded-2xl p-5 mb-8">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-poke-surface2 border border-poke-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          {#if (data.user as any).favoritePokemonId}
            <img src={spriteUrl((data.user as any).favoritePokemonId)} alt={data.user.username} class="w-full h-full object-contain p-0.5" />
          {:else}
            <span class="text-poke-accent font-bold text-sm">{data.user.username[0].toUpperCase()}</span>
          {/if}
        </div>
        <div class="flex-1">
          <!-- svelte-ignore a11y_autofocus -->
          <textarea
            bind:value={newPostContent}
            onkeydown={handleKeydown}
            placeholder="¿Qué está pasando en BenjaVerse?"
            rows="3"
            maxlength="2000"
            class="w-full bg-transparent text-gray-200 placeholder-gray-500 text-sm resize-none outline-none"
          ></textarea>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-poke-border">
            <span class="text-xs text-gray-500">{newPostContent.length}/2000 · Ctrl+Enter para publicar</span>
            <button
              onclick={submitPost}
              disabled={posting || !newPostContent.trim()}
              class="btn-accent text-xs py-1.5 px-4 disabled:opacity-40"
            >
              {posting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="bg-poke-surface border border-poke-border rounded-2xl p-5 mb-8 text-center">
      <p class="text-gray-400 text-sm">
        <a href="/login" class="text-poke-accent hover:underline">Inicia sesión</a> para publicar en el muro
      </p>
    </div>
  {/if}

  <!-- Feed -->
  {#if posts.length === 0}
    <div class="text-center py-16 text-gray-500">
      <p class="text-4xl mb-3">📝</p>
      <p>Aún no hay posts. ¡Sé el primero!</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each posts as post (post.id)}
        <article class="bg-poke-surface border border-poke-border rounded-2xl overflow-hidden">
          <!-- Post header -->
          <div class="p-4 pb-3">
            <div class="flex items-center justify-between mb-3">
              <a href="/profile/{post.author.username}" class="flex items-center gap-2.5 group">
                <div class="w-8 h-8 rounded-full bg-poke-surface2 border border-poke-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {#if post.author.favoritePokemonId}
                    <img src={spriteUrl(post.author.favoritePokemonId)} alt={post.author.username} class="w-full h-full object-contain p-0.5" />
                  {:else}
                    <span class="text-poke-accent font-bold text-xs">{post.author.username[0].toUpperCase()}</span>
                  {/if}
                </div>
                <div>
                  <p class="text-sm font-medium text-white group-hover:text-poke-accent transition-colors">@{post.author.username}</p>
                  <p class="text-[11px] text-gray-500">{timeAgo(post.createdAt)}</p>
                </div>
              </a>
              {#if data.user && (data.user.id === post.author.id || (data.user as any).isAdmin)}
                <button onclick={() => deletePost(post.id)}
                  class="text-gray-600 hover:text-red-400 transition-colors text-xs">
                  ✕
                </button>
              {/if}
            </div>
            <!-- Content -->
            <p class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>

          <!-- Actions bar -->
          <div class="px-4 py-2.5 border-t border-poke-border/50 flex items-center gap-5">
            <button
              onclick={() => toggleLike(post)}
              class="flex items-center gap-1.5 text-xs transition-colors {myLike(post) ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}"
            >
              <svg class="w-4 h-4" fill={myLike(post) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.likes.length}
            </button>
            <button
              onclick={() => showComments = { ...showComments, [post.id]: !showComments[post.id] }}
              class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-poke-accent transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.comments.length}
            </button>
          </div>

          <!-- Comments section -->
          {#if showComments[post.id]}
            <div class="border-t border-poke-border/50">
              {#if post.comments.length > 0}
                <div class="divide-y divide-poke-border/30 px-4">
                  {#each post.comments as c}
                    <div class="py-2.5 flex items-start gap-2">
                      <div class="w-6 h-6 rounded-full bg-poke-surface2 border border-poke-border flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                        {#if c.author.favoritePokemonId}
                          <img src={spriteUrl(c.author.favoritePokemonId)} alt={c.author.username} class="w-full h-full object-contain" />
                        {:else}
                          <span class="text-poke-accent font-bold text-[10px]">{c.author.username[0].toUpperCase()}</span>
                        {/if}
                      </div>
                      <div class="flex-1 min-w-0">
                        <a href="/profile/{c.author.username}" class="text-xs font-medium text-poke-accent hover:underline">@{c.author.username}</a>
                        <p class="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                        <p class="text-[10px] text-gray-600 mt-0.5">{timeAgo(c.createdAt)}</p>
                      </div>
                      {#if data.user && (data.user.id === c.author.id || (data.user as any).isAdmin)}
                        <button onclick={() => deleteComment(post, c.id)}
                          class="text-gray-600 hover:text-red-400 transition-colors text-[11px] flex-shrink-0 mt-0.5">✕</button>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
              {#if data.user}
                <div class="px-4 py-3 flex gap-2">
                  <div class="w-6 h-6 rounded-full bg-poke-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span class="text-poke-accent font-bold text-[10px]">{data.user.username[0].toUpperCase()}</span>
                  </div>
                  <div class="flex-1 flex gap-2">
                    <textarea
                      bind:value={commentTexts[post.id]}
                      onkeydown={(e) => handleKeydown(e, post)}
                      placeholder="Escribe un comentario..."
                      rows="1"
                      maxlength="1000"
                      class="flex-1 bg-poke-bg border border-poke-border rounded-lg px-3 py-1.5 text-xs text-black placeholder-gray-600 resize-none outline-none focus:border-poke-accent/50 transition-colors"
                    ></textarea>
                    <button
                      onclick={() => submitComment(post)}
                      disabled={submittingComment[post.id] || !(commentTexts[post.id] ?? '').trim()}
                      class="btn-accent text-xs py-1.5 px-3 disabled:opacity-40 self-start"
                    >Enviar</button>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </article>
      {/each}
    </div>

    {#if nextCursor}
      <div class="mt-6 text-center">
        <button onclick={loadMore} disabled={loadingMore}
          class="btn-secondary text-sm py-2 px-6 disabled:opacity-40">
          {loadingMore ? 'Cargando...' : 'Cargar más'}
        </button>
      </div>
    {/if}
  {/if}
</div>
