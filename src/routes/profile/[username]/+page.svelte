<script lang="ts">
  import { untrack } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  let { data } = $props();
  const profileUser = $derived(data.profileUser);
  const teams = $derived(data.teams);
  const tournamentEntries = $derived(data.tournamentEntries);
  const stats = $derived(data.stats);
  const recentMatches = $derived(data.recentMatches);
  const isOwnProfile = $derived(data.isOwnProfile);

  const REGIONS = [
    { key: 'kantoCompleted',  label: 'Kanto',  icon: '🔴' },
    { key: 'johtoCompleted',  label: 'Johto',  icon: '⭐' },
    { key: 'hoennCompleted',  label: 'Hoenn',  icon: '🌊' },
    { key: 'sinnohCompleted', label: 'Sinnoh', icon: '❄️' },
  ] as const;

  let editingProfile = $state(false);
  let bioInput       = $state(untrack(() => data.profileUser.bio ?? ''));
  let favPokemonInput = $state(untrack(() => String(data.profileUser.favoritePokemonId || '')));
  let favPokemonId   = $state(untrack(() => data.profileUser.favoritePokemonId || 0));
  let pokedexSeen    = $state(untrack(() => data.profileUser.pokedexSeen ?? 0));
  let pokedexCaught  = $state(untrack(() => data.profileUser.pokedexCaught ?? 0));
  let regionState    = $state(untrack(() => ({
    kantoCompleted:  data.profileUser.kantoCompleted,
    johtoCompleted:  data.profileUser.johtoCompleted,
    hoennCompleted:  data.profileUser.hoennCompleted,
    sinnohCompleted: data.profileUser.sinnohCompleted,
    unovaCompleted:  data.profileUser.unovaCompleted,
    kalosCompleted:  data.profileUser.kalosCompleted,
    alolaCompleted:  data.profileUser.alolaCompleted,
    galarCompleted:  data.profileUser.galarCompleted,
    paldeaCompleted: data.profileUser.paldeaCompleted,
  })));
  let savingProfile  = $state(false);
  let profileError   = $state('');

  // Showcase: manual list, not derived from teams
  type ShowcaseItem = { pokemonId: number; pokemonName: string };
  const showcasePokemons = $derived((data as any).showcasePokemons as ShowcaseItem[]);
  let showcaseItems = $state<ShowcaseItem[]>(untrack(() => (data as any).showcasePokemons as ShowcaseItem[]));
  let showcaseInput  = $state('');
  let showcasePreviewId = $state(0);
  let showcaseDebounce: ReturnType<typeof setTimeout>;

  function onShowcaseInput(val: string) {
    showcaseInput = val;
    showcasePreviewId = 0;
    clearTimeout(showcaseDebounce);
    if (!val.trim()) return;
    showcaseDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${val.trim().toLowerCase()}`);
        if (res.ok) { const d = await res.json(); showcasePreviewId = d.id; }
      } catch { /* ignore */ }
    }, 500);
  }

  function addToShowcase() {
    if (!showcasePreviewId || !showcaseInput.trim()) return;
    const name = showcaseInput.trim().toLowerCase();
    if (showcaseItems.find(p => p.pokemonId === showcasePreviewId)) return;
    showcaseItems = [...showcaseItems, { pokemonId: showcasePreviewId, pokemonName: name }];
    showcaseInput = '';
    showcasePreviewId = 0;
  }

  function removeFromShowcase(id: number) {
    showcaseItems = showcaseItems.filter(p => p.pokemonId !== id);
  }

  const spriteUrl = (id: number, shiny = false) =>
    shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  let favDebounce: ReturnType<typeof setTimeout>;
  function onFavInput(val: string) {
    favPokemonInput = val;
    clearTimeout(favDebounce);
    if (!val.trim()) { favPokemonId = 0; return; }
    favDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${val.trim().toLowerCase()}`);
        if (res.ok) {
          const d = await res.json();
          favPokemonId = d.id;
        } else {
          favPokemonId = 0;
        }
      } catch { favPokemonId = 0; }
    }, 600);
  }

  async function saveProfile() {
    savingProfile = true;
    profileError = '';
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: bioInput,
          favoritePokemonId: favPokemonId,
          pokedexSeen,
          pokedexCaught,
          ...regionState,
          showcasePokemons: showcaseItems,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      await invalidateAll();
      editingProfile = false;
    } catch {
      profileError = 'No se pudo guardar el perfil';
    } finally {
      savingProfile = false;
    }
  }

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const completedRegions = $derived(
    REGIONS.filter(r => (profileUser as Record<string, unknown>)[r.key])
  );

  const winrate = $derived(
    stats.totalMatches > 0
      ? Math.round((stats.wins / stats.totalMatches) * 100)
      : 0
  );
</script>

<svelte:head><title>@{profileUser.username} &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10 space-y-10">

  <!-- Header card -->
  <div class="card bg-poke-surface2 flex flex-col sm:flex-row items-center sm:items-start gap-6">
    <!-- Avatar (favorite pokemon sprite) -->
    <div class="w-28 h-28 flex-shrink-0 rounded-2xl border border-poke-border bg-poke-surface flex items-center justify-center overflow-hidden">
      {#if favPokemonId}
        {#key favPokemonId}
          <img src={spriteUrl(favPokemonId)} alt="avatar" class="w-full h-full object-contain p-1" />
        {/key}
      {:else}
        <span class="text-5xl opacity-20">?</span>
      {/if}
    </div>

    <div class="flex-1 min-w-0 text-center sm:text-left">
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
        <h1 class="text-2xl font-bold text-white">@{profileUser.username}</h1>
        {#if isOwnProfile && !editingProfile}
          <button
            onclick={() => { editingProfile = true; bioInput = profileUser.bio ?? ''; favPokemonInput = String(profileUser.favoritePokemonId || ''); favPokemonId = profileUser.favoritePokemonId || 0; showcaseItems = [...showcasePokemons]; }}
            class="btn-secondary text-xs px-3 py-1"
          >✏️ Editar perfil</button>
        {/if}
      </div>
      <p class="text-xs text-gray-500 mb-3">Miembro desde {formatDate(profileUser.createdAt)}</p>

      {#if editingProfile}
        <div class="space-y-3">
          <div>
            <label for="bio-input" class="label">Descripción (máx. 300 caracteres)</label>
            <textarea
              id="bio-input"
              class="input resize-none"
              rows="3"
              maxlength="300"
              bind:value={bioInput}
              placeholder="Cuéntanos algo sobre ti..."
            ></textarea>
          </div>
          <div>
            <label for="fav-pokemon-input" class="label">Pokémon favorito (aparece como avatar)</label>
            <div class="flex items-center gap-3">
              <input
                id="fav-pokemon-input"
                type="text"
                class="input flex-1"
                placeholder="charizard, mewtwo..."
                value={favPokemonInput}
                oninput={(e) => onFavInput(e.currentTarget.value)}
              />
              {#if favPokemonId}
                <img src={spriteUrl(favPokemonId)} alt="" class="w-10 h-10 object-contain" />
              {/if}
            </div>
          </div>
          <!-- Pokédex -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="pdex-seen" class="label">Pokédex vistos</label>
              <input id="pdex-seen" type="number" min="0" max="1025" class="input" bind:value={pokedexSeen} />
            </div>
            <div>
              <label for="pdex-caught" class="label">Pokédex capturados</label>
              <input id="pdex-caught" type="number" min="0" max="1025" class="input" bind:value={pokedexCaught} />
            </div>
          </div>
          <!-- Regiones -->
          <div>
            <p class="label mb-2">Regiones completadas</p>
            <div class="flex flex-wrap gap-2">
              {#each REGIONS as region}
                {@const checked = (regionState as Record<string, boolean>)[region.key]}
                <button
                  type="button"
                  onclick={() => (regionState as Record<string, boolean>)[region.key] = !checked}
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all select-none
                    {checked
                      ? 'border-poke-gold bg-poke-gold/20 text-poke-gold shadow-sm shadow-poke-gold/20'
                      : 'border-gray-600 bg-poke-surface2 text-gray-400 hover:border-gray-400 hover:text-gray-200'}"
                >
                  {region.icon} {region.label}
                </button>
              {/each}
            </div>
          </div>
          <!-- Vitrina shiny -->
          <div>
            <p class="label mb-2">✨ Vitrina shiny</p>
            <!-- Current items -->
            {#if showcaseItems.length > 0}
              <div class="flex flex-wrap gap-2 mb-3">
                {#each showcaseItems as p}
                  <div class="relative group">
                    <div class="w-14 h-14 rounded-xl border border-poke-gold/50 bg-poke-gold/5 overflow-hidden">
                      <img
                        src={spriteUrl(p.pokemonId, true)}
                        alt={p.pokemonName}
                        class="w-full h-full object-contain p-0.5"
                        title={p.pokemonName}
                      />
                    </div>
                    <button
                      type="button"
                      onclick={() => removeFromShowcase(p.pokemonId)}
                      class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Quitar"
                    >×</button>
                    <p class="text-[10px] text-gray-400 mt-0.5 text-center capitalize truncate w-14">{p.pokemonName}</p>
                  </div>
                {/each}
              </div>
            {/if}
            <!-- Add input -->
            <div class="flex items-center gap-2">
              {#if showcasePreviewId}
                <img src={spriteUrl(showcasePreviewId, true)} alt="" class="w-8 h-8 object-contain flex-shrink-0" />
              {/if}
              <input
                type="text"
                class="input flex-1 text-sm"
                placeholder="charizard, mewtwo..."
                value={showcaseInput}
                oninput={(e) => onShowcaseInput(e.currentTarget.value)}
                onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToShowcase(); } }}
              />
              <button
                type="button"
                onclick={addToShowcase}
                disabled={!showcasePreviewId}
                class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border border-poke-accent text-poke-accent hover:bg-poke-accent/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >+ Agregar</button>
            </div>
          </div>
          {#if profileError}<p class="text-xs text-red-400">{profileError}</p>{/if}
          <div class="flex gap-2 pt-1">
            <button
              onclick={saveProfile}
              disabled={savingProfile}
              class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-poke-accent text-white hover:bg-poke-accent/80 disabled:opacity-40 transition-colors"
            >
              {savingProfile ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onclick={() => editingProfile = false}
              class="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200 transition-colors"
            >Cancelar</button>
          </div>
        </div>
      {:else if profileUser.bio}
        <p class="text-gray-300 text-sm leading-relaxed">{profileUser.bio}</p>
      {:else if isOwnProfile}
        <p class="text-gray-600 text-sm italic">Sin descripción. ¡Editá tu perfil!</p>
      {/if}
      <!-- Region medals -->
      {#if !editingProfile && completedRegions.length > 0}
        <div class="flex flex-wrap gap-2 mt-4">
          {#each completedRegions as region}
            <div
              title="Región {region.label} completada"
              class="inline-flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-poke-gold/40 bg-gradient-to-b from-poke-gold/15 to-poke-gold/5 shadow-sm shadow-poke-gold/10"
            >
              <span class="text-xl leading-none">{region.icon}</span>
              <span class="text-[10px] font-bold tracking-wide text-poke-gold uppercase">{region.label}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Stats -->
  <div>
    <h2 class="section-title mb-4">Estadísticas</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="card bg-poke-surface2 text-center">
        <p class="text-2xl font-bold text-white">{tournamentEntries.length}</p>
        <p class="text-xs text-gray-500 mt-1">Torneos</p>
      </div>
      <div class="card bg-poke-surface2 text-center">
        <p class="text-2xl font-bold text-white">{stats.totalMatches}</p>
        <p class="text-xs text-gray-500 mt-1">Partidas</p>
      </div>
      <div class="card bg-poke-surface2 text-center">
        <p class="text-2xl font-bold text-emerald-400">{stats.wins}</p>
        <p class="text-xs text-gray-500 mt-1">Victorias</p>
      </div>
      <div class="card bg-poke-surface2 text-center">
        <p class="text-2xl font-bold {winrate >= 50 ? 'text-poke-accent' : 'text-red-400'}">{winrate}%</p>
        <p class="text-xs text-gray-500 mt-1">Winrate</p>
      </div>
      {#if profileUser.pokedexSeen > 0}
        <div class="card bg-poke-surface2 text-center">
          <p class="text-2xl font-bold text-white">{profileUser.pokedexSeen}</p>
          <p class="text-xs text-gray-500 mt-1">Pokémon vistos</p>
        </div>
      {/if}
      {#if profileUser.pokedexCaught > 0}
        <div class="card bg-poke-surface2 text-center">
          <p class="text-2xl font-bold text-poke-accent">{profileUser.pokedexCaught}</p>
          <p class="text-xs text-gray-500 mt-1">Capturados</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Shiny showcase -->
  {#if showcasePokemons.length > 0}
    <div>
      <h2 class="section-title mb-4">✨ Vitrina shiny ({showcasePokemons.length})</h2>
      <div class="flex flex-wrap gap-3">
        {#each showcasePokemons as p}
          <div class="text-center">
            <div class="w-16 h-16 rounded-xl border border-poke-gold/60 bg-poke-gold/5 overflow-hidden">
              <img
                src={spriteUrl(p.pokemonId, true)}
                alt={p.pokemonName}
                class="w-full h-full object-contain p-0.5"
                title={p.pokemonName}
              />
            </div>
            <p class="text-xs text-gray-400 mt-1 capitalize truncate w-16">{p.pokemonName}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Recent matches -->
  {#if recentMatches.length > 0}
    <div>
      <h2 class="section-title mb-4">Partidas recientes</h2>
      <div class="space-y-2">
        {#each recentMatches as m}
          <div class="card bg-poke-surface2 flex items-center justify-between gap-4 py-3">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0
                {m.won ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}">
                {m.won ? 'V' : 'D'}
              </span>
              <span class="text-sm text-gray-300">vs <span class="text-white font-semibold">@{m.opponentUsername}</span></span>
            </div>
            <span class="text-xs text-gray-500">{m.tournamentName}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Tournaments -->
  {#if tournamentEntries.length > 0}
    <div>
      <h2 class="section-title mb-4">Torneos inscritos</h2>
      <div class="grid sm:grid-cols-2 gap-3">
        {#each tournamentEntries as entry}
          <a href="/tournaments/{entry.tournament.id}" class="card bg-poke-surface2 hover:border-poke-accent/50 transition-colors block">
            <p class="font-semibold text-white">{entry.tournament.name}</p>
            {#if entry.registeredTeam}
              <p class="text-xs text-gray-500 mt-1">Equipo: {entry.registeredTeam.name}</p>
            {/if}
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Published teams -->
  {#if teams.length > 0}
    <div>
      <h2 class="section-title mb-4">Equipos publicados</h2>
      <div class="space-y-6">
        {#each teams as team}
          <div class="card bg-poke-surface2">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-white">{team.name}</h3>
                {#if team.description}
                  <p class="text-sm text-gray-400 mt-0.5">{team.description}</p>
                {/if}
              </div>
              <a href="/teams/{profileUser.username}" class="text-xs text-poke-accent hover:underline">Ver todos</a>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {#each team.pokemons as p}
                <div class="text-center">
                  <div class="rounded-xl bg-poke-surface border border-poke-border p-1 {p.shiny ? 'border-poke-gold/50' : ''}">
                    <img
                      src={spriteUrl(p.pokemonId, p.shiny)}
                      alt={p.pokemonName}
                      class="w-full aspect-square object-contain"
                    />
                  </div>
                  <p class="text-xs text-gray-400 mt-1 capitalize truncate">{p.pokemonName}</p>
                  {#if p.shiny}<p class="text-xs text-poke-gold">✨</p>{/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

</div>
