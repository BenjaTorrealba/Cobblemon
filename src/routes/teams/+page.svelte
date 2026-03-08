<script lang="ts">
  let { data } = $props();

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Equipos &mdash; Cobbleverse</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="mb-10">
    <h1 class="text-3xl font-bold text-white mb-2">Equipos</h1>
    <p class="text-gray-500">Los equipos de todos los jugadores de Cobbleverse.</p>
  </div>

  {#if data.teams.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">🎮</div>
      <p>Todavía no hay equipos publicados.</p>
    </div>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.teams as team}
        <a href="/teams/{team.user.username}" class="card hover:border-poke-accent/50 transition-colors group block">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="font-bold text-white group-hover:text-poke-accent transition-colors">{team.name}</h2>
              <p class="text-xs text-gray-500">@{team.user.username}</p>
            </div>
            <span class="text-xs text-gray-600">{team.pokemons.length}/6</span>
          </div>
          {#if team.description}
            <p class="text-sm text-gray-500 mb-4 line-clamp-2">{team.description}</p>
          {/if}
          <div class="flex gap-1 flex-wrap">
            {#each team.pokemons as p}
              <img
                src={spriteUrl(p.pokemonId)}
                alt={p.pokemonName}
                class="w-12 h-12 object-contain"
                title={p.pokemonName}
              />
            {/each}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
