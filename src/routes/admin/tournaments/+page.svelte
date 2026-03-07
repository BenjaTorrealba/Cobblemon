<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';

  let { data } = $props();

  let showModal = $state($page.url.searchParams.get('create') === '1');
  let editingTournament = $state<typeof data.tournaments[0] | null>(null);
  let showPlayersModal = $state<typeof data.tournaments[0] | null>(null);

  // Form state
  let form = $state({
    name: '',
    description: '',
    format: '',
    rules: '',
    startDate: '',
    active: true,
  });

  function openCreate() {
    editingTournament = null;
    form = { name: '', description: '', format: '', rules: '', startDate: '', active: true };
    showModal = true;
  }

  function openEdit(t: typeof data.tournaments[0]) {
    editingTournament = t;
    form = {
      name: t.name,
      description: t.description,
      format: t.format,
      rules: t.rules,
      startDate: new Date(t.startDate).toISOString().slice(0, 10),
      active: t.active,
    };
    showModal = true;
  }

  async function saveTournament() {
    const body = { ...form, startDate: new Date(form.startDate).toISOString() };
    const url = editingTournament ? `/api/tournaments/${editingTournament.id}` : '/api/tournaments';
    const method = editingTournament ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      showModal = false;
      invalidateAll();
    } else {
      const err = await res.json();
      alert(err.error ?? 'Error al guardar');
    }
  }

  async function deleteTournament(id: number, name: string) {
    if (!confirm(`¿Eliminar el torneo "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
    if (res.ok) invalidateAll();
  }

  // Players management
  let playersInTournament = $state<{ player: { id: number; name: string } }[]>([]);
  let selectedPlayerId = $state('');

  async function openPlayers(t: typeof data.tournaments[0]) {
    const res = await fetch(`/api/tournaments/${t.id}`);
    const full = await res.json();
    playersInTournament = full.players;
    showPlayersModal = t;
    selectedPlayerId = '';
  }

  async function addPlayer() {
    if (!showPlayersModal || !selectedPlayerId) return;
    const res = await fetch(`/api/tournaments/${showPlayersModal.id}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: Number(selectedPlayerId) }),
    });
    if (res.ok) {
      openPlayers(showPlayersModal);
      invalidateAll();
    } else {
      const err = await res.json();
      alert(err.error ?? 'Error');
    }
  }

  async function removePlayer(playerId: number) {
    if (!showPlayersModal) return;
    const res = await fetch(`/api/tournaments/${showPlayersModal.id}/players`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (res.ok) {
      openPlayers(showPlayersModal);
      invalidateAll();
    }
  }

  const availablePlayers = $derived(
    data.players.filter(p => !playersInTournament.some(tp => tp.player.id === p.id))
  );
</script>

<svelte:head>
  <title>Torneos &mdash; Admin Cobbleverse</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-white">Torneos ({data.tournaments.length})</h2>
    <button onclick={openCreate} class="btn-primary">
      + Nuevo Torneo
    </button>
  </div>

  {#if data.tournaments.length === 0}
    <div class="card text-center py-12 text-gray-500">No hay torneos aún.</div>
  {:else}
    <div class="space-y-3">
      {#each data.tournaments as tournament}
        <div class="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="font-bold text-white">{tournament.name}</span>
              <span class="text-xs bg-poke-accent/20 text-poke-accent border border-poke-accent/30 px-2 py-0.5 rounded-full">{tournament.format}</span>
              {#if !tournament.active}
                <span class="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">Inactivo</span>
              {/if}
            </div>
            <div class="text-sm text-gray-500">
              {new Date(tournament.startDate).toLocaleDateString('es')} &bull;
              {tournament._count.players} jugadores &bull;
              {tournament._count.matches} combates
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick={() => openPlayers(tournament)} class="btn-secondary text-xs py-1.5 px-3">
              👥 Jugadores
            </button>
            <a href="/tournaments/{tournament.id}" target="_blank" class="btn-secondary text-xs py-1.5 px-3">
              👁 Ver
            </a>
            <button onclick={() => openEdit(tournament)} class="btn-secondary text-xs py-1.5 px-3">
              ✏ Editar
            </button>
            <button onclick={() => deleteTournament(tournament.id, tournament.name)} class="btn-danger text-xs py-1.5 px-3">
              🗑 Eliminar
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-poke-surface border border-poke-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-poke-border flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">
          {editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'}
        </h3>
        <button onclick={() => showModal = false} class="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="label" for="t-name">Nombre</label>
          <input id="t-name" type="text" bind:value={form.name} class="input" placeholder="Copa Cobbleverse S1" required />
        </div>
        <div>
          <label class="label" for="t-desc">Descripción</label>
          <textarea id="t-desc" bind:value={form.description} class="input resize-none h-20" placeholder="Descripción del torneo..."></textarea>
        </div>
        <div>
          <label class="label" for="t-format">Formato</label>
          <input id="t-format" type="text" bind:value={form.format} class="input" placeholder="Round Robin, Eliminatoria, etc." required />
        </div>
        <div>
          <label class="label" for="t-rules">Reglas completas</label>
          <textarea id="t-rules" bind:value={form.rules} class="input resize-none h-32" placeholder="Escribe las reglas del torneo..."></textarea>
        </div>
        <div>
          <label class="label" for="t-date">Fecha de inicio</label>
          <input id="t-date" type="date" bind:value={form.startDate} class="input" required />
        </div>
        <div class="flex items-center gap-3">
          <input type="checkbox" id="t-active" bind:checked={form.active} class="w-4 h-4 accent-poke-accent" />
          <label for="t-active" class="text-sm text-gray-300">Torneo activo (visible en la web)</label>
        </div>
      </div>
      <div class="p-6 border-t border-poke-border flex gap-3 justify-end">
        <button onclick={() => showModal = false} class="btn-secondary">Cancelar</button>
        <button onclick={saveTournament} class="btn-primary">
          {editingTournament ? 'Guardar cambios' : 'Crear torneo'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Players Modal -->
{#if showPlayersModal}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-poke-surface border border-poke-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-poke-border flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">👥 {showPlayersModal.name}</h3>
        <button onclick={() => { showPlayersModal = null; invalidateAll(); }} class="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        <!-- Add player -->
        {#if availablePlayers.length > 0}
          <div class="flex gap-2">
            <select bind:value={selectedPlayerId} class="input flex-1">
              <option value="">Seleccionar jugador...</option>
              {#each availablePlayers as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
            <button onclick={addPlayer} disabled={!selectedPlayerId} class="btn-primary px-4">+</button>
          </div>
        {:else}
          <p class="text-xs text-gray-500">Todos los jugadores ya están inscritos.</p>
        {/if}

        <!-- Player list -->
        {#if playersInTournament.length === 0}
          <p class="text-sm text-gray-500 italic text-center py-4">Sin participantes.</p>
        {:else}
          <ul class="space-y-2">
            {#each playersInTournament as tp}
              <li class="flex items-center justify-between bg-poke-surface2 rounded-lg px-4 py-2.5 border border-poke-border">
                <span class="text-gray-200 font-medium">{tp.player.name}</span>
                <button onclick={() => removePlayer(tp.player.id)} class="text-xs text-red-400 hover:text-red-300">×</button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
{/if}
