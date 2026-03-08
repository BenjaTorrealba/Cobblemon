<script lang="ts">
  let { data } = $props();

  let users = $state(data.users);
  let newUsername = $state('');
  let newPassword = $state('');
  let createError = $state('');
  let creating = $state(false);

  async function createUser(e: Event) {
    e.preventDefault();
    createError = '';
    creating = true;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (res.ok) {
        const user = await res.json();
        users = [...users, { ...user, team: null }];
        newUsername = '';
        newPassword = '';
      } else {
        const d = await res.json();
        createError = d.error ?? 'Error al crear usuario';
      }
    } catch {
      createError = 'Error de conexión';
    } finally {
      creating = false;
    }
  }

  async function deleteUser(id: number) {
    if (!confirm('¿Eliminar este usuario y su equipo?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) users = users.filter((u) => u.id !== id);
  }

  async function resetPassword(id: number) {
    const newPass = prompt('Nueva contraseña:');
    if (!newPass) return;
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass }),
    });
  }
</script>

<svelte:head><title>Usuarios &mdash; Admin</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-white">Usuarios</h1>
    <p class="text-gray-500 text-sm mt-1">Gestión de cuentas de jugadores</p>
  </div>

  <!-- Create user -->
  <div class="card">
    <h2 class="font-semibold text-white mb-4">Crear usuario</h2>
    <form onsubmit={createUser} class="grid sm:grid-cols-3 gap-4 items-end">
      {#if createError}
        <div class="sm:col-span-3 bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-4 py-2">
          {createError}
        </div>
      {/if}
      <div>
        <label class="label" for="new-username">Nombre de usuario</label>
        <input id="new-username" type="text" class="input" bind:value={newUsername} required />
      </div>
      <div>
        <label class="label" for="new-password">Contraseña</label>
        <input id="new-password" type="password" class="input" bind:value={newPassword} required />
      </div>
      <button type="submit" disabled={creating} class="btn-primary justify-center">
        {creating ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  </div>

  <!-- Users table -->
  <div class="card overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-poke-border">
          <th class="text-left py-3 px-2 text-gray-400 font-medium">Usuario</th>
          <th class="text-left py-3 px-2 text-gray-400 font-medium">Equipo</th>
          <th class="text-left py-3 px-2 text-gray-400 font-medium">Pokémon</th>
          <th class="text-right py-3 px-2 text-gray-400 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          <tr class="border-b border-poke-border/50 hover:bg-poke-surface2/50">
            <td class="py-3 px-2 font-medium text-white">@{user.username}</td>
            <td class="py-3 px-2 text-gray-400">{user.team ? '✓ Configurado' : '—'}</td>
            <td class="py-3 px-2 text-gray-400">{user.team?.pokemons?.length ?? 0} / 6</td>
            <td class="py-3 px-2 text-right space-x-3">
              <button
                onclick={() => resetPassword(user.id)}
                class="text-xs text-gray-500 hover:text-yellow-400 transition-colors"
              >Cambiar contraseña</button>
              <button
                onclick={() => deleteUser(user.id)}
                class="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >Eliminar</button>
            </td>
          </tr>
        {/each}
        {#if users.length === 0}
          <tr>
            <td colspan="4" class="py-10 text-center text-gray-600">No hay usuarios creados.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
