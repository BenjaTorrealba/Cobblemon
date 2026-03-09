<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Jugadores &mdash; Admin BenjaVerse</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-white">Jugadores registrados ({data.users.length})</h2>
    <a href="/admin/users" class="btn-secondary text-sm">Gestionar usuarios →</a>
  </div>

  {#if data.users.length === 0}
    <div class="card text-center py-12 text-gray-500">No hay usuarios registrados.</div>
  {:else}
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th class="text-center">Inscripciones</th>
            <th class="text-center">Combates</th>
          </tr>
        </thead>
        <tbody>
          {#each data.users as user}
            <tr>
              <td class="font-semibold text-white">@{user.username}</td>
              <td class="text-center text-gray-400">{user._count.tournamentEntries}</td>
              <td class="text-center text-gray-400">{user._count.matchesAsUser1 + user._count.matchesAsUser2}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
