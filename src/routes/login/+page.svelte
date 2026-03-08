<script lang="ts">
  import { goto } from '$app/navigation';

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleLogin(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        goto('/my-team');
      } else {
        const d = await res.json();
        error = d.error ?? 'Error al iniciar sesión';
      }
    } catch {
      error = 'Error de conexión';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Iniciar sesión &mdash; Cobbleverse</title></svelte:head>

<div class="min-h-[80vh] flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="text-5xl mb-4">⚔</div>
      <h1 class="text-xl font-bold text-white mb-1">Iniciar sesión</h1>
      <p class="text-gray-500 text-sm">Accede para gestionar tu equipo Cobblemon</p>
    </div>

    <form onsubmit={handleLogin} class="card space-y-4">
      {#if error}
        <div class="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      {/if}
      <div>
        <label class="label" for="username">Usuario</label>
        <input id="username" type="text" bind:value={username} class="input" autocomplete="username" required />
      </div>
      <div>
        <label class="label" for="password">Contraseña</label>
        <input id="password" type="password" bind:value={password} class="input" autocomplete="current-password" required />
      </div>
      <button type="submit" disabled={loading} class="btn-primary w-full justify-center">
        {#if loading}
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        {/if}
        Entrar
      </button>
    </form>
    <p class="text-center text-xs text-gray-600 mt-4">
      <a href="/" class="hover:text-gray-400">← Volver al inicio</a>
    </p>
  </div>
</div>