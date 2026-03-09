<script lang="ts">
  interface PokemonSlot {
    slot: number;
    pokemonName: string;
    pokemonId: number;
    item: string;
    ability: string;
    move1: string;
    move2: string;
    move3: string;
    move4: string;
  }

  let { pokemon = $bindable(), slot }: { pokemon: PokemonSlot; slot: number } = $props();

  let searchQuery = $state(pokemon.pokemonName);
  let searching = $state(false);
  let availableAbilities = $state<string[]>([]);
  let availableMoves = $state<string[]>([]);
  let searchError = $state('');
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Per-move filter queries
  let moveQueries = $state(['', '', '', '']);
  let moveOpen = $state([false, false, false, false]);

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  const itemSlug = $derived(pokemon.item?.trim().toLowerCase().replace(/ /g, '-') ?? '');

  function debounceSearch(val: string) {
    clearTimeout(debounceTimer);
    if (!val.trim()) return;
    debounceTimer = setTimeout(() => fetchPokemon(val.trim().toLowerCase()), 600);
  }

  async function fetchPokemon(name: string) {
    searching = true;
    searchError = '';
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) {
        searchError = 'Pokémon no encontrado';
        pokemon.pokemonId = 0;
        availableAbilities = [];
        return;
      }
      const data = await res.json();
      pokemon.pokemonName = data.name;
      pokemon.pokemonId = data.id;
      availableAbilities = data.abilities.map((a: { ability: { name: string } }) => a.ability.name);
      if (!pokemon.ability || !availableAbilities.includes(pokemon.ability)) {
        pokemon.ability = availableAbilities[0] ?? '';
      }
      availableMoves = data.moves.map((m: { move: { name: string } }) => m.move.name).sort();
    } catch {
      searchError = 'Error al conectar con PokeAPI';
    } finally {
      searching = false;
    }
  }

  $effect(() => {
    searchQuery = pokemon.pokemonName;
    moveQueries = [pokemon.move1 ?? '', pokemon.move2 ?? '', pokemon.move3 ?? '', pokemon.move4 ?? ''];
    if (!pokemon.pokemonId) {
      availableAbilities = [];
      availableMoves = [];
      searchError = '';
    } else if (availableAbilities.length === 0) {
      fetchPokemon(pokemon.pokemonName);
    }
  });

  const moveKeys = ['move1', 'move2', 'move3', 'move4'] as const;

  function filteredMoves(idx: number) {
    const q = moveQueries[idx].toLowerCase();
    if (!q) return availableMoves.slice(0, 50);
    return availableMoves.filter(m => m.includes(q)).slice(0, 50);
  }

  function selectMove(idx: number, move: string) {
    (pokemon as Record<string, unknown>)[moveKeys[idx]] = move;
    moveQueries[idx] = move;
    moveOpen[idx] = false;
  }

  function onMoveInput(idx: number, val: string) {
    moveQueries[idx] = val;
    (pokemon as Record<string, unknown>)[moveKeys[idx]] = val;
    moveOpen[idx] = true;
  }

  function initMoveQuery(idx: number) {
    const val = (pokemon as Record<string, unknown>)[moveKeys[idx]] as string;
    if (moveQueries[idx] === '' && val) moveQueries[idx] = val;
  }
</script>

<div class="card bg-poke-surface2 space-y-4">
  <div class="flex items-start gap-4">
    <!-- Sprite -->
    <div class="w-20 h-20 flex-shrink-0 bg-poke-surface rounded-xl border border-poke-border flex items-center justify-center overflow-hidden">
      {#if pokemon.pokemonId}
        <img
          src={spriteUrl(pokemon.pokemonId)}
          alt={pokemon.pokemonName}
          class="w-full h-full object-contain p-1"
        />
      {:else}
        <span class="text-4xl opacity-20">?</span>
      {/if}
    </div>

    <div class="flex-1 space-y-2 min-w-0">
      <!-- Search -->
      <div>
        <label class="label">Pokémon #{slot}</label>
        <div class="relative">
          <input
            type="text"
            class="input pr-8 {searchError ? 'border-red-600' : ''}"
            placeholder="charizard, pikachu..."
            bind:value={searchQuery}
            oninput={(e) => debounceSearch(e.currentTarget.value)}
          />
          {#if searching}
            <svg class="absolute right-2.5 top-3 w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          {/if}
        </div>
        {#if searchError}
          <p class="text-xs text-red-400 mt-1">{searchError}</p>
        {:else if pokemon.pokemonId}
          <p class="text-xs text-emerald-400 mt-1 capitalize">✓ {pokemon.pokemonName} &nbsp;#{pokemon.pokemonId}</p>
        {/if}
      </div>
      <!-- Item -->
      <div>
        <label class="label">Objeto</label>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 flex-shrink-0">
            {#if itemSlug}
              {#key itemSlug}
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemSlug}.png`}
                  alt={pokemon.item}
                  class="w-8 h-8 object-contain"
                  onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
              {/key}
            {/if}
          </div>
          <input type="text" class="input" placeholder="Life Orb, Choice Scarf..." bind:value={pokemon.item} />
        </div>
      </div>
    </div>
  </div>

  <!-- Ability -->
  <div>
    <label class="label">Habilidad</label>
    {#if availableAbilities.length > 0}
      <select bind:value={pokemon.ability} class="input capitalize">
        {#each availableAbilities as ab}
          <option value={ab} class="capitalize">{ab.replace(/-/g, ' ')}</option>
        {/each}
      </select>
    {:else}
      <input
        type="text"
        class="input"
        placeholder="Busca un Pokémon para ver habilidades..."
        bind:value={pokemon.ability}
        disabled={!pokemon.pokemonId}
      />
    {/if}
  </div>

  <!-- Moves -->
  <div class="grid grid-cols-2 gap-2">
    {#each moveKeys as key, idx}
      <div>
        <label class="label">Mov. {idx + 1}</label>
        {#if availableMoves.length > 0}
          <div class="relative">
            <input
              type="text"
              class="input text-sm capitalize"
              placeholder="buscar movimiento..."
              value={moveQueries[idx] || (pokemon[key] ?? '')}
              onfocus={() => { initMoveQuery(idx); moveOpen[idx] = true; }}
              oninput={(e) => onMoveInput(idx, e.currentTarget.value)}
              onblur={() => setTimeout(() => { moveOpen[idx] = false; }, 150)}
            />
            {#if moveOpen[idx] && filteredMoves(idx).length > 0}
              <ul class="absolute z-20 left-0 right-0 mt-1 max-h-44 overflow-y-auto bg-poke-surface border border-poke-border rounded-lg shadow-xl text-sm">
                {#each filteredMoves(idx) as move}
                  <li>
                    <button
                      type="button"
                      class="w-full text-left px-3 py-1.5 capitalize hover:bg-poke-surface2 transition-colors text-gray-300"
                      onmousedown={() => selectMove(idx, move)}
                    >
                      {move.replace(/-/g, ' ')}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {:else}
          <input
            type="text"
            class="input text-sm"
            placeholder="ej: Flamethrower"
            bind:value={pokemon[key] as string}
          />
        {/if}
      </div>
    {/each}
  </div>
</div>
