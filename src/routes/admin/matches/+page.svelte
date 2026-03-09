<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';

  let { data } = $props();

  let showCreateModal = $state($page.url.searchParams.get('create') === '1');
  let winnerModal = $state<typeof data.matches[0] | null>(null);
  let selectedWinnerId = $state('');
  let filterTournament = $state('');

  // Create form
  let createForm = $state({
    tournamentId: '',
    user1Id: '',
    user2Id: '',
    scheduledDate: '',
    scheduledTime: '',
  });
  let createError = $state('');

  // Users available for the selected tournament (registered entries), or all users
  let tournamentUsers = $state<{ id: number; username: string }[]>(data.users);

  async function onTournamentChange() {
    if (!createForm.tournamentId) {
      tournamentUsers = data.users;
      return;
    }
    const res = await fetch(`/api/tournaments/${createForm.tournamentId}/entries`);
    if (res.ok) {
      const entries = await res.json();
      tournamentUsers = entries.map((e: { user: { id: number; username: string } }) => e.user);
    } else {
      tournamentUsers = data.users;
    }
    createForm.user1Id = '';
    createForm.user2Id = '';
  }

  async function createMatch() {
    createError = '';
    const { tournamentId, user1Id, user2Id, scheduledDate, scheduledTime } = createForm;
    if (!tournamentId || !user1Id || !user2Id || !scheduledDate || !scheduledTime) {
      createError = 'Todos los campos son obligatorios.';
      return;
    }
    if (user1Id === user2Id) {
      createError = 'Los jugadores deben ser distintos.';
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tournamentId: Number(tournamentId),
        user1Id: Number(user1Id),
        user2Id: Number(user2Id),
        scheduledAt,
      }),
    });

    if (res.ok) {
      showCreateModal = false;
      createForm = { tournamentId: '', user1Id: '', user2Id: '', scheduledDate: '', scheduledTime: '' };
      tournamentUsers = data.users;
      invalidateAll();
    } else {
      const d = await res.json();
      createError = d.error ?? 'Error al crear combate';
    }
  }

  async function setWinner() {
    if (!winnerModal || !selectedWinnerId) return;
    const res = await fetch(`/api/matches/${winnerModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', winnerId: Number(selectedWinnerId) }),
    });
    if (res.ok) {
      winnerModal = null;
      invalidateAll();
    }
  }

  async function deleteMatch(id: number) {
    if (!confirm('¿Eliminar este enfrentamiento?')) return;
    const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
    if (res.ok) invalidateAll();
  }

  function formatDateTime(d: string | Date) {
    const date = new Date(d);
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) +
           ' ' + date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  const filteredMatches = $derived(
    filterTournament
      ? data.matches.filter((m: { tournament: { id: number } }) => m.tournament.id === Number(filterTournament))
      : data.matches
  );
</script>

<svelte:head>
  <title>Enfrentamientos &mdash; Admin BenjaVerse</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <h2 class="text-xl font-bold text-white">Enfrentamientos ({filteredMatches.length})</h2>
    <div class="flex items-center gap-3">
      <select bind:value={filterTournament} class="input py-2 text-sm w-48">
        <option value="">Todos los torneos</option>
        {#each data.tournaments as t}
          <option value={t.id}>{t.name}</option>
        {/each}
      </select>
      <button onclick={() => { showCreateModal = true; createError = ''; tournamentUsers = data.users; createForm = { tournamentId: '', user1Id: '', user2Id: '', scheduledDate: '', scheduledTime: '' }; }} class="btn-primary">
        + Nuevo Combate
      </button>
    </div>
  </div>

  {#if filteredMatches.length === 0}
    <div class="card text-center py-12 text-gray-500">No hay enfrentamientos.</div>
  {:else}
    <div class="space-y-2">
      {#each filteredMatches as match}
        <div class="card py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="flex-shrink-0 text-xs text-gray-500 font-mono w-32 leading-relaxed">
              {formatDateTime(match.scheduledAt)}
            </div>
            <div class="flex items-center gap-3 min-w-0">
              <span class="font-semibold truncate {match.winner?.id === match.user1.id ? 'text-emerald-400' : 'text-white'}">@{match.user1.username}</span>
              <span class="text-xs font-bold text-gray-500 flex-shrink-0">VS</span>
              <span class="font-semibold truncate {match.winner?.id === match.user2.id ? 'text-emerald-400' : 'text-white'}">@{match.user2.username}</span>
            </div>
            <span class="text-xs text-gray-500 hidden lg:block">{match.tournament.name}</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap flex-shrink-0">
            <span class={match.status === 'completed' ? 'badge-completed' : 'badge-scheduled'}>
              {match.status === 'completed' ? 'Completado' : 'Programado'}
            </span>
            {#if match.status === 'scheduled'}
              <button
                onclick={() => { winnerModal = match; selectedWinnerId = ''; }}
                class="btn-success text-xs py-1.5 px-3"
              >
                ✓ Marcar ganador
              </button>
            {/if}
            <button onclick={() => deleteMatch(match.id)} class="btn-danger text-xs py-1.5 px-3">🗑</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Create Match Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-poke-surface border border-poke-border rounded-2xl w-full max-w-md">
      <div class="p-6 border-b border-poke-border flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">Nuevo Enfrentamiento</h3>
        <button onclick={() => showCreateModal = false} class="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        {#if createError}
          <div class="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-4 py-3">{createError}</div>
        {/if}
        <div>
          <label class="label" for="m-tournament">Torneo</label>
          <select id="m-tournament" bind:value={createForm.tournamentId} onchange={onTournamentChange} class="input">
            <option value="">Seleccionar torneo...</option>
            {#each data.tournaments as t}
              <option value={t.id}>{t.name}</option>
            {/each}
          </select>
          {#if createForm.tournamentId && tournamentUsers.length === 0}
            <p class="text-xs text-amber-500 mt-1">⚠ Ningún usuario inscrito en este torneo aún.</p>
          {:else if createForm.tournamentId}
            <p class="text-xs text-gray-600 mt-1">{tournamentUsers.length} usuarios inscritos.</p>
          {/if}
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="m-u1">Jugador 1</label>
            <select id="m-u1" bind:value={createForm.user1Id} class="input">
              <option value="">Seleccionar...</option>
              {#each tournamentUsers as u}
                <option value={u.id}>@{u.username}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="label" for="m-u2">Jugador 2</label>
            <select id="m-u2" bind:value={createForm.user2Id} class="input">
              <option value="">Seleccionar...</option>
              {#each tournamentUsers as u}
                <option value={u.id}>@{u.username}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="m-date">Fecha</label>
            <input id="m-date" type="date" bind:value={createForm.scheduledDate} class="input" />
          </div>
          <div>
            <label class="label" for="m-time">Hora</label>
            <input id="m-time" type="time" bind:value={createForm.scheduledTime} class="input" />
          </div>
        </div>
      </div>
      <div class="p-6 border-t border-poke-border flex gap-3 justify-end">
        <button onclick={() => showCreateModal = false} class="btn-secondary">Cancelar</button>
        <button onclick={createMatch} class="btn-primary">Crear combate</button>
      </div>
    </div>
  </div>
{/if}

<!-- Winner Modal -->
{#if winnerModal}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-poke-surface border border-poke-border rounded-2xl w-full max-w-sm">
      <div class="p-6 border-b border-poke-border">
        <h3 class="text-lg font-bold text-white">Marcar Ganador</h3>
        <p class="text-sm text-gray-500 mt-1">
          @{winnerModal.user1.username} vs @{winnerModal.user2.username}
        </p>
      </div>
      <div class="p-6 space-y-3">
        <button
          onclick={() => selectedWinnerId = String(winnerModal!.user1.id)}
          class="w-full py-4 rounded-xl border-2 font-bold transition-all duration-150 text-left px-5 {selectedWinnerId === String(winnerModal.user1.id) ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300' : 'border-poke-border bg-poke-surface2 text-gray-300 hover:border-poke-accent/50'}"
        >
          🏆 @{winnerModal.user1.username}
        </button>
        <button
          onclick={() => selectedWinnerId = String(winnerModal!.user2.id)}
          class="w-full py-4 rounded-xl border-2 font-bold transition-all duration-150 text-left px-5 {selectedWinnerId === String(winnerModal.user2.id) ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300' : 'border-poke-border bg-poke-surface2 text-gray-300 hover:border-poke-accent/50'}"
        >
          🏆 @{winnerModal.user2.username}
        </button>
      </div>
      <div class="p-6 border-t border-poke-border flex gap-3 justify-end">
        <button onclick={() => winnerModal = null} class="btn-secondary">Cancelar</button>
        <button onclick={setWinner} disabled={!selectedWinnerId} class="btn-success">Confirmar</button>
      </div>
    </div>
  </div>
{/if}
