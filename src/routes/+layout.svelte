<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { goto, invalidateAll } from '$app/navigation';

  let { data, children } = $props();

  const isAdmin = $derived($page.url.pathname.startsWith('/admin'));

  async function userLogout() {
    await fetch('/api/auth/user-logout', { method: 'POST' });
    await invalidateAll();
    goto('/');
  }
</script>

<div class="min-h-screen flex flex-col">
  {#if !isAdmin}
    <nav class="border-b border-poke-border bg-poke-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a href="/" class="flex items-center gap-3 group">
            <img src="/squirtle.png" class="w-8 h-8 object-contain" alt="BenjaVerse" />
            <span class="font-display text-xs text-white group-hover:text-poke-accent transition-colors tracking-wider">
              BenjaVerse
            </span>
          </a>
          <div class="flex items-center gap-4">
            <a href="/" class="text-sm text-gray-400 hover:text-white transition-colors">Inicio</a>
            <a href="/news" class="text-sm text-gray-400 hover:text-white transition-colors">Noticias</a>
            <a href="/tournaments" class="text-sm text-gray-400 hover:text-white transition-colors">Torneos</a>
            <a href="/teams" class="text-sm text-gray-400 hover:text-white transition-colors">Equipos</a>
            <a href="/players" class="text-sm text-gray-400 hover:text-white transition-colors">Jugadores</a>
            {#if data.user}
              <a href="/my-team" class="text-sm text-gray-400 hover:text-white transition-colors">Mi Equipo</a>
              <a href="/profile/{data.user.username}" class="text-sm text-gray-400 hover:text-white transition-colors">Mi Perfil</a>
              <button onclick={userLogout} class="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                @{data.user.username} · Salir
              </button>
            {:else}
              <a href="/login" class="btn-secondary text-xs py-2 px-3">Iniciar sesión</a>
            {/if}
            <a href="/admin" class="btn-secondary text-xs py-2 px-3">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Admin
            </a>
          </div>
        </div>
      </div>
    </nav>
  {/if}

  <main class="flex-1">
    {@render children()}
  </main>

  {#if !isAdmin}
    <footer class="border-t border-poke-border bg-poke-surface py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        <p>Server hecho por Benzuino el Babuino:v</p>
      </div>
    </footer>
  {/if}
</div>
