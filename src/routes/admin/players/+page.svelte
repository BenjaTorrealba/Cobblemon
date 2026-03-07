<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';

  let { data } = $props();

  let showModal = $state($page.url.searchParams.get('create') === '1');
  let newName = $state('');
  let error = $state('');

  async function createPlayer() {
    error = '';
    if (!newName.trim()) { error = 'El nombre es obligatorio.'; return; }

    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (res.ok) {
      newName = '';
      showModal = false;
      invalidateAll();
    } else {
      const d = await res.json();
      error = d.error ?? 'Error al crear jugador';
    }
  }

  async function deletePlayer(id: number, name: string) {
    if (!confirm(`¿Eliminar al jugador "${name}"?`)) return;
    const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
    if (res.ok) invalidateAll();
    else alert('No se pudo eliminar (puede tener enfrentamientos asignados)');
  }
</script>

<svelte:head>
  <title>Jugadores &mdash; Admin Cobbleverse</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-white">Jugadores ({data.players.length})</h2>
    <button onclick={() => { showModal = true; newName = ''; error = ''; }} class="btn-primary">
      + Nuevo Jugador
    </button>
  </div>

  {#if data.players.length === 0}
    <div class="card text-center py-12 text-gray-500">No hay jugadores registrados.</div>
  {:else}
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Jugador</th>
            <th class="text-center">Torneos</th>
            <th class="text-center">Combates</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each data.players as player}
            <tr>
              <td class="font-semibold text-white">{player.name}</td>
              <td class="text-center text-gray-400">{player._count.tournaments}</td>
              <td class="text-center text-gray-400">{player._count.matchesAsPlayer1 + player._count.matchesAsPlayer2}</td>
              <td class="text-right">
                <button onclick={() => deletePlayer(player.id, player.name)} class="btn-danger text-xs py-1.5 px-3">
                  🗑 Eliminar
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-poke-surface border border-poke-border rounded-2xl w-full max-w-sm">
      <div class="p-6 border-b border-poke-border flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">Nuevo Jugador</h3>
        <button onclick={() => showModal = false} class="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        {#if error}
          <div class="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
        {/if}
        <div>
          <label class="label" for="p-name">Nombre del jugador</label>
          <input
            id="p-name"
            type="text"
            bind:value={newName}
            class="input"
            placeholder="Ash Ketchum"
            onkeydown={(e) => e.key === 'Enter' && createPlayer()}
          />
        </div>
      </div>
      <div class="p-6 border-t border-poke-border flex gap-3 justify-end">
        <button onclick={() => showModal = false} class="btn-secondary">Cancelar</button>
        <button onclick={createPlayer} class="btn-primary">Crear jugador</button>
      </div>
    </div>
  </div>
{/if}
