<script lang="ts">
  let { data } = $props();

  const { team } = data;

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Equipo de @{team.user.username} &mdash; Cobbleverse</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <a href="/teams" class="text-xs text-gray-500 hover:text-gray-300 mb-6 inline-block">← Todos los equipos</a>

  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white">{team.name}</h1>
    <p class="text-sm text-gray-500 mt-1">
      Equipo de <span class="text-poke-accent">@{team.user.username}</span>
    </p>
    {#if team.description}
      <p class="text-gray-400 mt-2">{team.description}</p>
    {/if}
  </div>

  {#if team.pokemons.length === 0}
    <div class="text-center py-16 text-gray-600">
      <div class="text-5xl mb-4">🎮</div>
      <p>Este jugador todavía no ha configurado su equipo.</p>
    </div>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each team.pokemons as p}
        <div class="card bg-poke-surface2 text-center">
          <img
            src={spriteUrl(p.pokemonId)}
            alt={p.pokemonName}
            class="w-24 h-24 mx-auto object-contain"
          />
          <h3 class="font-bold text-white capitalize mt-2">{p.pokemonName}</h3>
          {#if p.item}
            <p class="text-xs text-gray-500 mt-1">Objeto: {p.item}</p>
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
