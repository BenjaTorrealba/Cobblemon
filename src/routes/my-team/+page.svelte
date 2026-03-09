<script lang="ts">
  import PokemonSlotEditor from '$lib/components/PokemonSlotEditor.svelte';

  let { data } = $props();

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

  function makeEmptySlot(num: number): PokemonSlot {
    return { slot: num, pokemonName: '', pokemonId: 0, item: '', ability: '', move1: '', move2: '', move3: '', move4: '' };
  }

  let teamName = $state(data.team?.name ?? 'Mi Equipo');
  let teamDesc = $state(data.team?.description ?? '');
  let published = $state(data.team?.published ?? false);
  let pokemons = $state<PokemonSlot[]>(
    Array.from({ length: 6 }, (_, i) => {
      const existing = data.team?.pokemons.find((p: PokemonSlot) => p.slot === i + 1);
      return existing ? { ...existing } : makeEmptySlot(i + 1);
    })
  );

  let saving = $state(false);
  let message = $state('');
  let messageType = $state<'success' | 'error'>('success');

  async function saveTeam() {
    saving = true;
    message = '';
    try {
      const res = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName, description: teamDesc, pokemons, published }),
      });
      if (res.ok) {
        message = '¡Equipo guardado correctamente!';
        messageType = 'success';
      } else {
        message = 'Error al guardar el equipo.';
        messageType = 'error';
      }
    } catch {
      message = 'Error de conexión.';
      messageType = 'error';
    } finally {
      saving = false;
    }
  }

  function clearTeam() {
    pokemons = Array.from({ length: 6 }, (_, i) => makeEmptySlot(i + 1));
    teamName = 'Mi Equipo';
    teamDesc = '';
    message = '';
  }

  async function togglePublish() {
    published = !published;
    const res = await fetch('/api/teams', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName, description: teamDesc, pokemons, published }),
    });
    if (res.ok) {
      message = published ? 'Equipo publicado. ¡Ahora todos pueden verlo!' : 'Equipo ocultado.';
      messageType = 'success';
    } else {
      published = !published; // revert on error
    }
  }
</script>

<svelte:head><title>Mi Equipo &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-1">Mi Equipo</h1>
    <p class="text-gray-500 text-sm">
      Hola, <span class="text-poke-accent">@{data.user.username}</span>. Diseña tu equipo Cobblemon.
    </p>
  </div>

  <!-- Visibility banner -->
  <div class="mb-6 flex items-center justify-between rounded-xl border px-4 py-3
    {published ? 'border-emerald-700/50 bg-emerald-900/20' : 'border-poke-border bg-poke-surface2'}">
    <div>
      <p class="text-sm font-medium {published ? 'text-emerald-400' : 'text-gray-400'}">
        {published ? '🌐 Equipo público' : '🔒 Equipo privado'}
      </p>
      <p class="text-xs text-gray-600 mt-0.5">
        {published ? 'Todos pueden ver tu equipo en /equipos.' : 'Solo tú puedes ver tu equipo.'}
      </p>
    </div>
    <button
      onclick={togglePublish}
      class="text-xs px-3 py-1.5 rounded-lg border transition-colors
        {published
          ? 'border-red-700/50 text-red-400 hover:bg-red-900/30'
          : 'border-poke-accent/50 text-poke-accent hover:bg-poke-accent/10'}">
      {published ? 'Ocultar' : 'Publicar'}
    </button>
  </div>

  <!-- Team info -->
  <div class="card mb-8 grid sm:grid-cols-2 gap-4">
    <div>
      <label class="label">Nombre del equipo</label>
      <input class="input" bind:value={teamName} placeholder="Mi Equipo" />
    </div>
    <div>
      <label class="label">Descripción (opcional)</label>
      <input class="input" bind:value={teamDesc} placeholder="Breve descripción de tu equipo..." />
    </div>
  </div>

  <!-- Slots -->
  <div class="grid lg:grid-cols-2 gap-6 mb-8">
    {#each pokemons as pokemon, i}
      <PokemonSlotEditor bind:pokemon={pokemons[i]} slot={i + 1} />
    {/each}
  </div>

  {#if message}
    <div class="mb-4 rounded-lg px-4 py-3 text-sm {messageType === 'success'
      ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-400'
      : 'bg-red-900/30 border border-red-700/50 text-red-400'}">
      {message}
    </div>
  {/if}

  <button onclick={clearTeam} class="btn-secondary mr-3">
    🗑 Limpiar equipo
  </button>
  <button onclick={saveTeam} disabled={saving} class="btn-primary">
    {#if saving}
      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    {/if}
    Guardar equipo
  </button>
</div>
