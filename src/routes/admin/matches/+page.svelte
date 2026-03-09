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
    player1Id: '',
    player2Id: '',
    scheduledDate: '',
    scheduledTime: '',
  });
  let createError = $state('');

  async function createMatch() {
    createError = '';
    const { tournamentId, player1Id, player2Id, scheduledDate, scheduledTime } = createForm;
    if (!tournamentId || !player1Id || !player2Id || !scheduledDate || !scheduledTime) {
      createError = 'Todos los campos son obligatorios.';
      return;
    }
    if (player1Id === player2Id) {
      createError = 'Los jugadores deben ser distintos.';
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tournamentId: Number(tournamentId),
        player1Id: Number(player1Id),
        player2Id: Number(player2Id),
        scheduledAt,
      }),
    });

    if (res.ok) {
      showCreateModal = false;
      createForm = { tournamentId: '', player1Id: '', player2Id: '', scheduledDate: '', scheduledTime: '' };
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

  // Players in selected tournament for create form
  const tournamentPlayers = $derived(async () => {
    if (!createForm.tournamentId) return data.players;
    const res = await fetch(`/api/tournaments/${createForm.tournamentId}`);
    const t = await res.json();
    return t.players?.map((tp: { player: typeof data.players[0] }) => tp.player) ?? data.players;
  });
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
      <button onclick={() => { showCreateModal = true; createError = ''; }} class="btn-primary">
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
              <span class="font-semibold text-white truncate {match.winner?.id === match.player1.id ? 'text-emerald-400' : ''}">{match.player1.name}</span>
              <span class="text-xs font-bold text-gray-500 flex-shrink-0">VS</span>
              <span class="font-semibold text-white truncate {match.winner?.id === match.player2.id ? 'text-emerald-400' : ''}">{match.player2.name}</span>
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
          <select id="m-tournament" bind:value={createForm.tournamentId} class="input">
            <option value="">Seleccionar torneo...</option>
            {#each data.tournaments as t}
              <option value={t.id}>{t.name}</option>
            {/each}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="m-p1">Jugador 1</label>
            <select id="m-p1" bind:value={createForm.player1Id} class="input">
              <option value="">Seleccionar...</option>
              {#each data.players as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="label" for="m-p2">Jugador 2</label>
            <select id="m-p2" bind:value={createForm.player2Id} class="input">
              <option value="">Seleccionar...</option>
              {#each data.players as p}
                <option value={p.id}>{p.name}</option>
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
          {winnerModal.player1.name} vs {winnerModal.player2.name}
        </p>
      </div>
      <div class="p-6 space-y-3">
        <button
          onclick={() => selectedWinnerId = String(winnerModal!.player1.id)}
          class="w-full py-4 rounded-xl border-2 font-bold transition-all duration-150 text-left px-5 {selectedWinnerId === String(winnerModal.player1.id) ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300' : 'border-poke-border bg-poke-surface2 text-gray-300 hover:border-poke-accent/50'}"
        >
          🏆 {winnerModal.player1.name}
        </button>
        <button
          onclick={() => selectedWinnerId = String(winnerModal!.player2.id)}
          class="w-full py-4 rounded-xl border-2 font-bold transition-all duration-150 text-left px-5 {selectedWinnerId === String(winnerModal.player2.id) ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300' : 'border-poke-border bg-poke-surface2 text-gray-300 hover:border-poke-accent/50'}"
        >
          🏆 {winnerModal.player2.name}
        </button>
      </div>
      <div class="p-6 border-t border-poke-border flex gap-3 justify-end">
        <button onclick={() => winnerModal = null} class="btn-secondary">Cancelar</button>
        <button onclick={setWinner} disabled={!selectedWinnerId} class="btn-success">Confirmar</button>
      </div>
    </div>
  </div>
{/if}
