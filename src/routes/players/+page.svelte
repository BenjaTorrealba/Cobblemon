<script lang="ts">
  let { data } = $props();

  let search = $state('');
  const filtered = $derived(
    search.trim()
      ? data.users.filter((u: { username: string }) =>
          u.username.toLowerCase().includes(search.trim().toLowerCase())
        )
      : data.users
  );

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Jugadores &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white mb-2">Jugadores</h1>
    <p class="text-gray-500 mb-6">Todos los entrenadores de BenjaVerse.</p>
    <div class="flex items-center gap-3 max-w-sm">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Buscar jugador..."
          class="input pl-9 text-sm"
          bind:value={search}
        />
      </div>
      {#if search}
        <button onclick={() => search = ''} class="text-sm text-gray-500 hover:text-gray-300 transition-colors">Limpiar</button>
      {/if}
    </div>
  </div>

  {#if data.users.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">👤</div>
      <p>Todavía no hay jugadores registrados.</p>
    </div>
  {:else if filtered.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">🔍</div>
      <p>No se encontró ningún jugador con ese nombre.</p>
    </div>
  {:else}
    {#if search}
      <p class="text-sm text-gray-500 mb-4">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
    {/if}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filtered as user}
        <a
          href="/profile/{user.username}"
          class="card bg-poke-surface2 hover:border-poke-accent/50 transition-colors group flex items-center gap-4"
        >
          <!-- Avatar -->
          <div class="w-14 h-14 flex-shrink-0 rounded-xl border border-poke-border bg-poke-surface flex items-center justify-center overflow-hidden">
            {#if user.favoritePokemonId}
              <img src={spriteUrl(user.favoritePokemonId)} alt="avatar" class="w-full h-full object-contain p-1" />
            {:else}
              <span class="text-2xl opacity-20">?</span>
            {/if}
          </div>
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white group-hover:text-poke-accent transition-colors truncate">@{user.username}</p>
            {#if user.bio}
              <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">{user.bio}</p>
            {/if}
            <div class="flex gap-3 mt-1.5 text-xs text-gray-600">
              <span title="Equipos">🎮 {user._count.teams}</span>
              <span title="Torneos">🏆 {user._count.tournamentEntries}</span>
              <span title="Victorias">⚔️ {user._count.wonMatches}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
