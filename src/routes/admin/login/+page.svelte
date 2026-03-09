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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        goto('/admin');
      } else {
        const data = await res.json();
        error = data.error ?? 'Error al iniciar sesión';
      }
    } catch {
      error = 'Error de conexión';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Admin &mdash; BenjaVerse</title>
</svelte:head>

<div class="min-h-screen bg-poke-darker flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="w-14 h-14 bg-gradient-to-br from-poke-accent to-poke-blue rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
        ⚔
      </div>
      <h1 class="font-display text-sm text-white tracking-wider mb-1">BenjaVerse</h1>
      <p class="text-gray-500 text-sm">Panel de Administración</p>
    </div>

    <form onsubmit={handleLogin} class="card space-y-4">
      {#if error}
        <div class="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      {/if}

      <div>
        <label class="label" for="username">Usuario</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          class="input"
          placeholder="admin"
          autocomplete="username"
          required
        />
      </div>

      <div>
        <label class="label" for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          class="input"
          placeholder="••••••••"
          autocomplete="current-password"
          required
        />
      </div>

      <button type="submit" disabled={loading} class="btn-primary w-full justify-center">
        {#if loading}
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        {/if}
        Iniciar Sesión
      </button>
    </form>

    <p class="text-center text-xs text-gray-600 mt-6">
      <a href="/" class="hover:text-gray-400 transition-colors">← Volver al sitio</a>
    </p>
  </div>
</div>
