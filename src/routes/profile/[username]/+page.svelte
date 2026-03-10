<script lang="ts">
  import { untrack } from 'svelte';
  let { data } = $props();
  const profileUser = $derived(data.profileUser);
  const teams = $derived(data.teams);
  const tournamentEntries = $derived(data.tournamentEntries);
  const stats = $derived(data.stats);
  const recentMatches = $derived(data.recentMatches);
  const isOwnProfile = $derived(data.isOwnProfile);

  let editingProfile = $state(false);
  let bioInput = $state(untrack(() => data.profileUser.bio ?? ''));
  let favPokemonInput = $state(untrack(() => String(data.profileUser.favoritePokemonId || '')));
  let favPokemonId = $state(untrack(() => data.profileUser.favoritePokemonId || 0));
  let savingProfile = $state(false);
  let profileError = $state('');

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
        body: JSON.stringify({ bio: bioInput, favoritePokemonId: favPokemonId }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      editingProfile = false;
    } catch (e) {
      profileError = 'No se pudo guardar el perfil';
    } finally {
      savingProfile = false;
    }
  }

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  }

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
            onclick={() => { editingProfile = true; bioInput = profileUser.bio ?? ''; favPokemonInput = String(profileUser.favoritePokemonId || ''); favPokemonId = profileUser.favoritePokemonId || 0; }}
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
          {#if profileError}<p class="text-xs text-red-400">{profileError}</p>{/if}
          <div class="flex gap-2">
            <button class="btn" onclick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Guardando...' : 'Guardar'}
            </button>
            <button class="btn-secondary" onclick={() => editingProfile = false}>Cancelar</button>
          </div>
        </div>
      {:else if profileUser.bio}
        <p class="text-gray-300 text-sm leading-relaxed">{profileUser.bio}</p>
      {:else if isOwnProfile}
        <p class="text-gray-600 text-sm italic">Sin descripción. ¡Editá tu perfil!</p>
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
    </div>
  </div>

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
