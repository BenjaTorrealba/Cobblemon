<script lang="ts">
  let { data } = $props();
  const notifications: any[] = data.notifications;

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
  }

  const typeIcon: Record<string, string> = {
    comment_team: '💬',
    comment_news: '📰',
    comment_post: '💬',
    like_post: '❤️',
  };
</script>

<div class="max-w-2xl mx-auto px-4 py-10">
  <h1 class="text-2xl font-display text-white mb-6">Notificaciones</h1>

  {#if notifications.length === 0}
    <div class="text-center py-16 text-gray-500">
      <p class="text-4xl mb-3">🔔</p>
      <p>Sin notificaciones</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each notifications as n}
        <a href={n.link || '/wall'} class="flex items-start gap-4 p-4 bg-poke-surface border border-poke-border rounded-xl hover:border-poke-accent/40 transition-colors group">
          <span class="text-xl mt-0.5">{typeIcon[n.type] ?? '🔔'}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-200 leading-snug group-hover:text-white transition-colors">{n.message}</p>
            <p class="text-xs text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
