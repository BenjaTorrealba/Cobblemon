<script lang="ts">
  let { data } = $props();

  const spriteUrl = (id: number, shiny = false) =>
    shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Equipos de @{data.username} &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 text-sm text-gray-500 mb-8">
    <a href="/teams" class="hover:text-gray-300 transition-colors">Equipos</a>
    <span>/</span>
    <span class="text-white">@{data.username}</span>
  </div>

  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white">
      Equipos de <a href="/profile/{data.username}" class="text-poke-accent hover:underline">@{data.username}</a>
    </h1>
    <p class="text-sm text-gray-500 mt-1">{data.teams.length} equipo{data.teams.length !== 1 ? 's' : ''} publicado{data.teams.length !== 1 ? 's' : ''}</p>
  </div>

  <div class="grid sm:grid-cols-2 gap-4">
    {#each data.teams as team}
      <a
        href="/teams/{data.username}/{team.id}"
        class="card bg-poke-surface2 hover:border-poke-accent/50 transition-colors group block"
      >
        <h2 class="font-bold text-white group-hover:text-poke-accent transition-colors mb-1">{team.name}</h2>
        {#if team.description}
          <p class="text-sm text-gray-500 mb-3 line-clamp-2">{team.description}</p>
        {/if}
        <div class="flex gap-1 flex-wrap mt-2">
          {#each team.pokemons as p}
            <img
              src={spriteUrl(p.pokemonId, p.shiny)}
              alt={p.pokemonName}
              class="w-11 h-11 object-contain rounded {p.shiny ? 'ring-1 ring-poke-gold/70' : ''}"
              title="{p.pokemonName}{p.shiny ? ' ✨' : ''}"
            />
          {/each}
        </div>
        <p class="text-xs text-gray-600 mt-3">{team.pokemons.length}/6 Pokémon · Ver equipo →</p>
      </a>
    {/each}
  </div>
</div>

