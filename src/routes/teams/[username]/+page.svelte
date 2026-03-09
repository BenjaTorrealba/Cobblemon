<script lang="ts">
  let { data } = $props();

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Equipos de @{data.username} &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <a href="/teams" class="text-xs text-gray-500 hover:text-gray-300 mb-6 inline-block">← Todos los equipos</a>

  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white">Equipos de <span class="text-poke-accent">@{data.username}</span></h1>
    <p class="text-sm text-gray-500 mt-1">{data.teams.length} equipo{data.teams.length !== 1 ? 's' : ''} publicado{data.teams.length !== 1 ? 's' : ''}</p>
  </div>

  <div class="space-y-10">
    {#each data.teams as team}
      <div>
        <div class="mb-4">
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
                <img
                  src={spriteUrl(p.pokemonId)}
                  alt={p.pokemonName}
                  class="w-24 h-24 mx-auto object-contain"
                />
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
      </div>

      {#if data.teams.indexOf(team) < data.teams.length - 1}
        <hr class="border-poke-border" />
      {/if}
    {/each}
  </div>
</div>
