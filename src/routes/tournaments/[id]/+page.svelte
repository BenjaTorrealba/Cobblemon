<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import PokemonSlotEditor from '$lib/components/PokemonSlotEditor.svelte';

  let { data } = $props();
  const { tournament, standings } = data;

  // Registration state
  let selectedTeamId = $state<number | null>(data.myTeams?.[0]?.id ?? null);
  let registering = $state(false);
  let regMessage = $state('');
  let regMessageType = $state<'success' | 'error'>('success');
  let myEntry = $state(data.myEntry);
  let expandedEntry = $state<number | null>(null);

  async function register() {
    if (!selectedTeamId) return;
    registering = true;
    regMessage = '';
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: selectedTeamId }),
      });
      const d = await res.json();
      if (res.ok) {
        myEntry = d;
        regMessage = '¡Inscripción exitosa! Tu equipo ha sido registrado y bloqueado.';
        regMessageType = 'success';
        await invalidateAll();
      } else {
        regMessage = d.error ?? 'Error al inscribirse';
        regMessageType = 'error';
      }
    } catch {
      regMessage = 'Error de conexión';
      regMessageType = 'error';
    } finally {
      registering = false;
    }
  }

  async function unregister() {
    if (!confirm('¿Desinscribirte del torneo? Perderás tu lugar.')) return;
    registering = true;
    regMessage = '';
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/register`, { method: 'DELETE' });
      if (res.ok) {
        myEntry = null;
        regMessage = 'Te has desinscrito del torneo.';
        regMessageType = 'success';
        await invalidateAll();
      } else {
        const d = await res.json();
        regMessage = d.error ?? 'Error';
        regMessageType = 'error';
      }
    } catch {
      regMessage = 'Error de conexión';
      regMessageType = 'error';
    } finally {
      registering = false;
    }
  }

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function formatDateTime(d: string | Date) {
    const date = new Date(d);
    return {
      date: date.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  const completedMatches = $derived(tournament.matches.filter((m: { status: string }) => m.status === 'completed'));
  const scheduledMatches = $derived(tournament.matches.filter((m: { status: string }) => m.status === 'scheduled'));

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  // Swap UI state (when changesAllowed)
  let swapSlot = $state<number>(1);
  let swapping = $state(false);
  let swapMessage = $state('');
  let swapMessageType = $state<'success' | 'error'>('success');

  const emptyPokemon = (slot: number) => ({
    slot,
    pokemonName: '',
    pokemonId: 0,
    shiny: false,
    item: '',
    ability: '',
    move1: '',
    move2: '',
    move3: '',
    move4: '',
  });

  let swapPokemon = $state(emptyPokemon(1));

  $effect(() => {
    // When swapSlot changes, pre-fill with the current registered pokemon in that slot
    const existing = myEntry?.registeredTeam?.pokemons?.find(p => p.slot === swapSlot);
    swapPokemon = existing
      ? { slot: swapSlot, pokemonName: existing.pokemonName, pokemonId: existing.pokemonId, shiny: (existing as {shiny?: boolean}).shiny ?? false, item: existing.item, ability: existing.ability, move1: existing.move1, move2: existing.move2, move3: existing.move3, move4: existing.move4 }
      : emptyPokemon(swapSlot);
  });

  async function submitSwap() {
    if (!swapPokemon.pokemonName) {
      swapMessage = 'Debes seleccionar un Pokémon.';
      swapMessageType = 'error';
      return;
    }
    swapping = true;
    swapMessage = '';
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: swapSlot,
          pokemonName: swapPokemon.pokemonName,
          pokemonId: swapPokemon.pokemonId,
          shiny: swapPokemon.shiny,
          item: swapPokemon.item,
          ability: swapPokemon.ability,
          move1: swapPokemon.move1,
          move2: swapPokemon.move2,
          move3: swapPokemon.move3,
          move4: swapPokemon.move4,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        myEntry = d;
        swapMessage = '¡Cambio guardado! El token ha sido consumido.';
        swapMessageType = 'success';
        await invalidateAll();
      } else {
        swapMessage = d.error ?? 'Error al guardar el cambio';
        swapMessageType = 'error';
      }
    } catch {
      swapMessage = 'Error de conexión';
      swapMessageType = 'error';
    } finally {
      swapping = false;
    }
  }
</script>

<svelte:head>
  <title>{tournament.name} &mdash; BenjaVerse</title>
</svelte:head>

<!-- Header Banner -->
<div class="bg-gradient-to-b from-poke-surface to-poke-darker border-b border-poke-border">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <a href="/" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
      ← Volver al inicio
    </a>
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-3">
          <span class="bg-poke-accent/20 text-poke-accent text-xs font-semibold px-3 py-1 rounded-full border border-poke-accent/30">
            {tournament.format}
          </span>
          {#if tournament.active}
            <span class="badge-online">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Activo
            </span>
          {:else}
            <span class="badge-offline">Finalizado</span>
          {/if}
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
        <p class="text-gray-400">{tournament.description}</p>
      </div>
      <div class="text-right flex-shrink-0">
        <div class="text-xs text-gray-500 mb-1">Fecha de inicio</div>
        <div class="text-sm font-medium text-gray-300 capitalize">{formatDate(tournament.startDate)}</div>
      </div>
    </div>
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

    <!-- Left column: Rules & Participants -->
    <div class="space-y-8">

      <!-- Rules -->
      <section class="card">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-poke-accent">📜</span> Reglamento
        </h2>
        <div class="prose prose-invert prose-sm max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap">
          {tournament.rules}
        </div>
      </section>

      <!-- Participants -->
      <section class="card">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-poke-blue">👥</span>
          Participantes
          <span class="ml-auto text-sm text-gray-500 font-normal">{data.userEntries.length}</span>
        </h2>
        {#if data.userEntries.length === 0}
          <p class="text-sm text-gray-500 italic">Sin participantes aún.</p>
        {:else}
          <ul class="space-y-2">
            {#each data.userEntries as entry, i}
              <li>
                <button
                  type="button"
                  class="w-full flex items-center gap-3 py-1.5 text-left hover:bg-poke-surface2 rounded-lg px-2 -mx-2 transition-colors"
                  onclick={() => expandedEntry = expandedEntry === entry.id ? null : entry.id}
                >
                  <span class="w-6 h-6 bg-poke-surface2 border border-poke-border rounded-full flex items-center justify-center text-xs text-gray-500 font-mono flex-shrink-0">
                    {i + 1}
                  </span>
                  <span class="text-gray-200 font-medium flex-1">@{entry.user.username}</span>
                  {#if entry.registeredTeam}
                    <span class="text-xs text-gray-500">{entry.registeredTeam.name}</span>
                    <span class="text-xs text-gray-600">{expandedEntry === entry.id ? '▲' : '▼'}</span>
                  {/if}
                </button>
                {#if expandedEntry === entry.id && entry.registeredTeam}
                  <div class="mt-2 ml-9 p-3 rounded-lg bg-poke-surface border border-poke-border">
                    <p class="text-xs text-poke-gold font-semibold mb-2">🔒 Equipo bloqueado — {entry.registeredTeam.name}</p>
                    <div class="flex flex-wrap gap-2">
                      {#each entry.registeredTeam.pokemons as p}
                        <div class="flex flex-col items-center">
                          <img src={spriteUrl(p.pokemonId)} alt={p.pokemonName} class="w-10 h-10 object-contain" />
                          <span class="text-xs text-gray-400 capitalize mt-0.5">{p.pokemonName}</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <!-- Self registration -->
      {#if tournament.active}
        <section class="card">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span class="text-poke-accent">🎫</span>
            Mi inscripción
          </h2>

          {#if !data.user}
            <p class="text-sm text-gray-500"><a href="/login" class="text-poke-accent hover:underline">Inicia sesión</a> para inscribirte al torneo.</p>
          {:else if myEntry}
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-emerald-400 text-sm font-medium">✅ Inscrito</span>
                <span class="text-xs text-gray-500">Equipo: {myEntry.registeredTeam?.name ?? '—'}</span>
              </div>
              {#if myEntry.registeredTeam}
                <div class="p-3 rounded-lg bg-poke-surface border border-poke-gold/30">
                  <p class="text-xs text-poke-gold mb-2">🔒 Equipo registrado y bloqueado</p>
                  <div class="flex flex-wrap gap-2">
                    {#each myEntry.registeredTeam.pokemons as p}
                      <div class="flex flex-col items-center">
                        <img src={spriteUrl(p.pokemonId)} alt={p.pokemonName} class="w-10 h-10 object-contain" />
                        <span class="text-xs text-gray-400 capitalize mt-0.5">{p.pokemonName}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Swap section: only shown when admin grants permission -->
              {#if myEntry.changesAllowed}
                <div class="mt-4 p-4 rounded-xl border border-poke-gold/40 bg-poke-gold/5">
                  <p class="text-poke-gold text-sm font-semibold mb-4">⚡ El admin habilitó 1 cambio de Pokémon</p>
                  <div class="mb-4">
                    <label class="label" for="swap-slot">Ranura a reemplazar</label>
                    <select id="swap-slot" bind:value={swapSlot} class="input">
                      {#each (myEntry.registeredTeam?.pokemons ?? []) as p}
                        <option value={p.slot}>#{p.slot} — {p.pokemonName || '(vacío)'}</option>
                      {/each}
                    </select>
                  </div>
                  <PokemonSlotEditor bind:pokemon={swapPokemon} slot={swapSlot} />
                  <div class="mt-4 flex items-center gap-3">
                    <button onclick={submitSwap} disabled={swapping} class="btn-primary text-sm">
                      {#if swapping}
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      {/if}
                      Confirmar cambio
                    </button>
                    <span class="text-xs text-gray-500">⚠️ Solo puedes hacer este cambio una vez.</span>
                  </div>
                  {#if swapMessage}
                    <div class="mt-3 rounded-lg px-3 py-2 text-sm {swapMessageType === 'success' ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-400' : 'bg-red-900/30 border border-red-700/50 text-red-400'}">
                      {swapMessage}
                    </div>
                  {/if}
                </div>
              {/if}

              <button onclick={unregister} disabled={registering} class="text-xs px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-900/30 transition-colors">
                Desinscribirse
              </button>
            </div>
          {:else if data.myTeams.length === 0}
            <p class="text-sm text-gray-500">No tienes equipos. <a href="/my-team" class="text-poke-accent hover:underline">Crea uno</a> primero.</p>
          {:else}
            <div class="space-y-3">
              <div>
                <label class="label">Selecciona tu equipo</label>
                <select bind:value={selectedTeamId} class="input">
                  {#each data.myTeams as team}
                    <option value={team.id}>{team.name} ({team.pokemons.length} Pokémon)</option>
                  {/each}
                </select>
              </div>
              <p class="text-xs text-gray-500">⚠️ Una vez inscrito, tu equipo quedará bloqueado y no podrá cambiarse.</p>
              <button onclick={register} disabled={registering || !selectedTeamId} class="btn-primary">
                {#if registering}<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>{/if}
                Inscribirme al torneo
              </button>
            </div>
          {/if}

          {#if regMessage}
            <div class="mt-3 rounded-lg px-3 py-2 text-sm {regMessageType === 'success' ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-400' : 'bg-red-900/30 border border-red-700/50 text-red-400'}">
              {regMessage}
            </div>
          {/if}
        </section>
      {/if}

    </div>

    <!-- Right column: Standings & Matches -->
    <div class="lg:col-span-2 space-y-8">

      <!-- Standings -->
      <section>
        <h2 class="section-title">
          <span class="text-poke-gold">🥇</span>
          Tabla de Posiciones
        </h2>
        {#if standings.length === 0}
          <div class="card text-center py-8">
            <p class="text-gray-500 text-sm">No hay datos de posiciones aún.</p>
          </div>
        {:else}
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th class="w-10">#</th>
                  <th>Jugador</th>
                  <th class="text-center w-16">PJ</th>
                  <th class="text-center w-16">W</th>
                  <th class="text-center w-16">L</th>
                  <th class="text-center w-20">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {#each standings as row, i}
                  <tr class={i === 0 && row.points > 0 ? 'bg-poke-gold/5' : ''}>
                    <td class="text-center text-gray-500 font-mono text-xs">
                      {#if i === 0 && row.points > 0}
                        <span class="text-poke-gold">🥇</span>
                      {:else if i === 1 && row.points > 0}
                        <span class="text-gray-400">🥈</span>
                      {:else if i === 2 && row.points > 0}
                        <span class="text-amber-700">🥉</span>
                      {:else}
                        {i + 1}
                      {/if}
                    </td>
                    <td class="font-semibold text-white">@{row.user.username}</td>
                    <td class="text-center text-gray-400">{row.played}</td>
                    <td class="text-center text-emerald-400 font-semibold">{row.wins}</td>
                    <td class="text-center text-red-400">{row.losses}</td>
                    <td class="text-center">
                      <span class="font-bold text-lg {i === 0 && row.points > 0 ? 'text-poke-gold' : 'text-white'}">
                        {row.points}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="text-xs text-gray-600 mt-2">Victoria = 3 pts &bull; Derrota = 0 pts</p>
        {/if}
      </section>

      <!-- Upcoming Matches -->
      {#if scheduledMatches.length > 0}
        <section>
          <h2 class="section-title">
            <span class="text-poke-blue">⚔</span>
            Próximos Combates
          </h2>
          <div class="space-y-2">
            {#each scheduledMatches as match}
              {@const dt = formatDateTime(match.scheduledAt)}
              <div class="card py-4 flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="flex-shrink-0 text-center bg-poke-surface2 border border-poke-border rounded-lg px-3 py-2 min-w-[60px]">
                    <div class="text-xs text-gray-500">{dt.date}</div>
                    <div class="text-sm font-bold text-white">{dt.time}</div>
                  </div>
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <span class="font-semibold text-white truncate">@{match.user1.username}</span>
                    <span class="text-xs font-bold text-gray-500 flex-shrink-0">VS</span>
                    <span class="font-semibold text-white truncate">@{match.user2.username}</span>
                  </div>
                </div>
                <span class="badge-scheduled flex-shrink-0">Programado</span>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Completed Matches -->
      {#if completedMatches.length > 0}
        <section>
          <h2 class="section-title">
            <span class="text-gray-500">✓</span>
            Resultados
          </h2>
          <div class="space-y-2">
            {#each completedMatches as match}
              {@const dt = formatDateTime(match.scheduledAt)}
              <div class="card py-4 flex items-center justify-between gap-4 opacity-80">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="flex-shrink-0 text-center bg-poke-surface2 border border-poke-border rounded-lg px-3 py-2 min-w-[60px]">
                    <div class="text-xs text-gray-500">{dt.date}</div>
                    <div class="text-sm font-bold text-gray-400">{dt.time}</div>
                  </div>
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <span class="font-semibold truncate {match.winner?.id === match.user1.id ? 'text-emerald-400' : 'text-gray-500 line-through decoration-gray-600'}">@{match.user1.username}</span>
                    <span class="text-xs font-bold text-gray-600 flex-shrink-0">VS</span>
                    <span class="font-semibold truncate {match.winner?.id === match.user2.id ? 'text-emerald-400' : 'text-gray-500 line-through decoration-gray-600'}">@{match.user2.username}</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1 flex-shrink-0">
                  {#if match.winner}
                    <span class="text-xs text-emerald-400 font-semibold">+@{match.winner.username}</span>
                  {/if}
                  <span class="badge-completed">Completado</span>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

    </div>
  </div>

</div>
