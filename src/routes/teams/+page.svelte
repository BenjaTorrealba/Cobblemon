<script lang="ts">
  import { goto } from '$app/navigation';
  let { data } = $props();

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Equipos &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="mb-10">
    <h1 class="text-3xl font-bold text-white mb-2">Equipos</h1>
    <p class="text-gray-500">Los equipos de todos los jugadores de BenjaVerse.</p>
  </div>

  {#if data.teams.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">🎮</div>
      <p>Todavía no hay equipos publicados.</p>
    </div>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.teams as team}
        <div class="card hover:border-poke-accent/50 transition-colors group block cursor-pointer"
          onclick={() => goto(`/teams/${team.user.username}`)}
          role="link" tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && goto(`/teams/${team.user.username}`)}
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
