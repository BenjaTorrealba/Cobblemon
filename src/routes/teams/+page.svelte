<script lang="ts">
  import { goto } from '$app/navigation';
  let { data } = $props();

  let filterUser = $state('');
  const filteredTeams = $derived(
    filterUser.trim()
      ? data.teams.filter((t: { user: { username: string } }) =>
          t.user.username.toLowerCase().includes(filterUser.trim().toLowerCase())
        )
      : data.teams
  );

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Equipos &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white mb-2">Equipos</h1>
    <p class="text-gray-500 mb-6">Los equipos de todos los jugadores de BenjaVerse.</p>
    <!-- Filter bar -->
    <div class="flex items-center gap-3 max-w-sm">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Filtrar por jugador..."
          class="input pl-9 text-sm"
          bind:value={filterUser}
        />
      </div>
      {#if filterUser}
        <button
          onclick={() => filterUser = ''}
          class="text-sm text-gray-500 hover:text-gray-300 transition-colors whitespace-nowrap"
        >Limpiar</button>
      {/if}
    </div>
  </div>

  {#if data.teams.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">🎮</div>
      <p>Todavía no hay equipos publicados.</p>
    </div>
  {:else if filteredTeams.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">👤</div>
      <p>No se encontraron equipos del jugador <span class="text-white font-semibold">@{filterUser}</span>.</p>
    </div>
  {:else}
    {#if filterUser}
      <p class="text-sm text-gray-500 mb-4">{filteredTeams.length} equipo{filteredTeams.length !== 1 ? 's' : ''} de <span class="text-poke-accent">@{filterUser.trim()}</span></p>
    {/if}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredTeams as team}
        <div class="card hover:border-poke-accent/50 transition-colors group block cursor-pointer"
          onclick={() => goto(`/teams/${team.user.username}/${team.id}`)}
          role="link" tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && goto(`/teams/${team.user.username}/${team.id}`)}
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="font-bold text-white group-hover:text-poke-accent transition-colors">{team.name}</h2>
              <a href="/profile/{team.user.username}"
                class="text-xs text-gray-500 hover:text-poke-accent transition-colors"
                onclick={(e) => e.stopPropagation()}>@{team.user.username}</a>
            </div>
            <span class="text-xs text-gray-600">{team.pokemons.length}/6</span>
          </div>
          {#if team.description}
            <p class="text-sm text-gray-500 mb-4 line-clamp-2">{team.description}</p>
          {/if}
          <div class="flex gap-1 flex-wrap">
            {#each team.pokemons as p}
              <img
                src={p.shiny
                  ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.pokemonId}.png`
                  : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.pokemonId}.png`}
                alt={p.pokemonName}
                class="w-12 h-12 object-contain rounded {p.shiny ? 'ring-1 ring-poke-gold/70' : ''}"
                title="{p.pokemonName}{p.shiny ? ' ✨' : ''}"
              />
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

