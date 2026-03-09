<script lang="ts">
  import { goto } from '$app/navigation';

  let username = $state('');
  let password = $state('');
  let code = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleRegister(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, code }),
      });
      if (res.ok) {
        goto('/my-team');
      } else {
        const d = await res.json();
        error = d.error ?? 'Error al registrarse';
      }
    } catch {
      error = 'Error de conexión';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Crear cuenta &mdash; Cobbleverse</title></svelte:head>

<div class="min-h-[80vh] flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="text-5xl mb-4">⚔</div>
      <h1 class="text-xl font-bold text-white mb-1">Crear cuenta</h1>
      <p class="text-gray-500 text-sm">Necesitas un código de acceso del admin para registrarte.</p>
    </div>

    <form onsubmit={handleRegister} class="card space-y-4">
      {#if error}
        <div class="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      {/if}
      <div>
        <label class="label" for="code">Código de registro</label>
        <input id="code" type="text" bind:value={code} class="input" placeholder="Código proporcionado por el admin" required />
      </div>
      <div>
        <label class="label" for="username">Nombre de usuario</label>
        <input id="username" type="text" bind:value={username} class="input" autocomplete="username"
          placeholder="Solo letras, números y _" required />
      </div>
      <div>
        <label class="label" for="password">Contraseña</label>
        <input id="password" type="password" bind:value={password} class="input" autocomplete="new-password" required />
      </div>
      <button type="submit" disabled={loading} class="btn-primary w-full justify-center">
        {#if loading}
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        {/if}
        Crear cuenta
      </button>
    </form>
    <p class="text-center text-xs text-gray-600 mt-4">
      ¿Ya tienes cuenta? <a href="/login" class="hover:text-gray-400 text-gray-500">Iniciar sesión</a>
      &nbsp;·&nbsp;
      <a href="/" class="hover:text-gray-400">← Inicio</a>
    </p>
  </div>
</div>
