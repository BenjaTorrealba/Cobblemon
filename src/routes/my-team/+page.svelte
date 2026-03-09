<script lang="ts">
  import PokemonSlotEditor from '$lib/components/PokemonSlotEditor.svelte';
  import { invalidateAll } from '$app/navigation';

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

  interface Team {
    id: number;
    name: string;
    description: string;
    published: boolean;
    pokemons: PokemonSlot[];
  }

  function makeEmptySlot(num: number): PokemonSlot {
    return { slot: num, pokemonName: '', pokemonId: 0, item: '', ability: '', move1: '', move2: '', move3: '', move4: '' };
  }

  // View state
  let isEditing = $state(false);
  let editingId = $state<number | null>(null);

  // Editor fields
  let teamName = $state('');
  let teamDesc = $state('');
  let published = $state(false);
  let pokemons = $state<PokemonSlot[]>(Array.from({ length: 6 }, (_, i) => makeEmptySlot(i + 1)));

  let saving = $state(false);
  let deleting = $state(false);
  let message = $state('');
  let messageType = $state<'success' | 'error'>('success');

  function openNewTeam() {
    editingId = null;
    teamName = '';
    teamDesc = '';
    published = false;
    pokemons = Array.from({ length: 6 }, (_, i) => makeEmptySlot(i + 1));
    message = '';
    isEditing = true;
  }

  function openEditTeam(team: Team) {
    editingId = team.id;
    teamName = team.name;
    teamDesc = team.description;
    published = team.published;
    pokemons = Array.from({ length: 6 }, (_, i) => {
      const existing = team.pokemons.find((p: PokemonSlot) => p.slot === i + 1);
      return existing ? { ...existing } : makeEmptySlot(i + 1);
    });
    message = '';
    isEditing = true;
  }

  function backToList() {
    isEditing = false;
    message = '';
  }

  function clearSlots() {
    pokemons = Array.from({ length: 6 }, (_, i) => makeEmptySlot(i + 1));
    teamName = '';
    teamDesc = '';
    message = '';
  }

  async function saveTeam() {
    saving = true;
    message = '';
    try {
      const res = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: teamName, description: teamDesc, pokemons, published }),
      });
      if (res.ok) {
        const d = await res.json();
        if (editingId === null) editingId = d.id;
        message = '¡Equipo guardado correctamente!';
        messageType = 'success';
        await invalidateAll();
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

  async function deleteTeam(id: number) {
    if (!confirm('¿Eliminar este equipo? Esta acción no se puede deshacer.')) return;
    deleting = true;
    try {
      const res = await fetch('/api/teams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await invalidateAll();
        backToList();
      }
    } finally {
      deleting = false;
    }
  }

  async function togglePublish() {
    published = !published;
    const res = await fetch('/api/teams', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, name: teamName, description: teamDesc, pokemons, published }),
    });
    if (res.ok) {
      message = published ? '¡Equipo publicado! Ahora todos pueden verlo.' : 'Equipo ocultado.';
      messageType = 'success';
      await invalidateAll();
    } else {
      published = !published;
    }
  }

  const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
</script>

<svelte:head><title>Mis Equipos &mdash; BenjaVerse</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">

{#if !isEditing}
  <!-- Team list view -->
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">Mis Equipos</h1>
      <p class="text-gray-500 text-sm">Hola, <span class="text-poke-accent">@{data.user.username}</span>.</p>
    </div>
    <button onclick={openNewTeam} class="btn-primary">
      <span>+</span> Nuevo equipo
    </button>
  </div>

  {#if data.teams.length === 0}
    <div class="text-center py-20 text-gray-600">
      <div class="text-6xl mb-4">🎮</div>
      <p class="text-lg mb-2">No tienes equipos todavía.</p>
      <p class="text-sm mb-6">¡Crea tu primer equipo Cobblemon!</p>
      <button onclick={openNewTeam} class="btn-primary">+ Crear equipo</button>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each data.teams as team}
        <div class="card bg-poke-surface2">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-white truncate">{team.name}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full border flex-shrink-0
                  {team.published
                    ? 'border-emerald-700/50 text-emerald-400 bg-emerald-900/20'
                    : 'border-poke-border text-gray-500'}">

                  {team.published ? '🌐 Público' : '🔒 Privado'}
                </span>
              </div>
              {#if team.description}
                <p class="text-xs text-gray-500 mb-2">{team.description}</p>
              {/if}
              <div class="flex gap-1 flex-wrap">
                {#each team.pokemons as p}
                  <img src={spriteUrl(p.pokemonId)} alt={p.pokemonName} class="w-10 h-10 object-contain" title={p.pokemonName} />
                {/each}
                {#if team.pokemons.length === 0}
                  <span class="text-xs text-gray-600">Sin Pokémon configurados</span>
                {/if}
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                onclick={() => openEditTeam(team)}
                class="text-xs px-3 py-1.5 rounded-lg border border-poke-accent/50 text-poke-accent hover:bg-poke-accent/10 transition-colors">
                ✏ Editar
              </button>
              <button
                onclick={() => deleteTeam(team.id)}
                disabled={deleting}
                class="text-xs px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-900/30 transition-colors">
                🗑
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

{:else}
  <!-- Editor view -->
  <div class="mb-6 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <button onclick={backToList} class="text-sm text-gray-400 hover:text-white transition-colors">← Volver</button>
      <h1 class="text-xl font-bold text-white">{editingId ? 'Editar equipo' : 'Nuevo equipo'}</h1>
    </div>
    {#if editingId}
      <button
        onclick={() => deleteTeam(editingId!)}
        disabled={deleting}
        class="text-xs px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-900/30 transition-colors">
        🗑 Eliminar equipo
      </button>
    {/if}
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
  <div class="card mb-6 grid sm:grid-cols-2 gap-4">
    <div>
      <label class="label">Nombre del equipo</label>
      <input class="input" bind:value={teamName} placeholder="Mi Equipo" />
    </div>
    <div>
      <label class="label">Descripción (opcional)</label>
      <input class="input" bind:value={teamDesc} placeholder="Breve descripción..." />
    </div>
  </div>

  <!-- Action buttons -->
  <div class="flex items-center gap-3 mb-6">
    <button onclick={clearSlots} class="btn-secondary">
      🗑 Limpiar slots
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

  {#if message}
    <div class="mb-6 rounded-lg px-4 py-3 text-sm {messageType === 'success'
      ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-400'
      : 'bg-red-900/30 border border-red-700/50 text-red-400'}">
      {message}
    </div>
  {/if}

  <!-- Slots -->
  <div class="grid lg:grid-cols-3 gap-6">
    {#each pokemons as pokemon, i}
      <PokemonSlotEditor bind:pokemon={pokemons[i]} slot={i + 1} />
    {/each}
  </div>
{/if}

</div>
