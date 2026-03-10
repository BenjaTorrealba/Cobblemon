<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { goto, invalidateAll } from '$app/navigation';

  let { data, children } = $props();

  const isAdmin = $derived($page.url.pathname.startsWith('/admin'));

  let showNotifDropdown = $state(false);
  let notifList = $state<any[]>([]);
  let loadingNotifs = $state(false);
  let mobileMenuOpen = $state(false);

  // Close mobile menu on navigation
  $effect(() => {
    $page.url.pathname;
    mobileMenuOpen = false;
    showNotifDropdown = false;
  });

  async function userLogout() {
    await fetch('/api/auth/user-logout', { method: 'POST' });
    await invalidateAll();
    goto('/');
  }

  async function openNotifs() {
    if (showNotifDropdown) { showNotifDropdown = false; return; }
    showNotifDropdown = true;
    loadingNotifs = true;
    const res = await fetch('/api/notifications');
    notifList = res.ok ? await res.json() : [];
    loadingNotifs = false;
    if ((data as any).unreadCount > 0) {
      await fetch('/api/notifications', { method: 'POST' });
      await invalidateAll();
    }
  }

  function closeNotifs(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.notif-dropdown')) showNotifDropdown = false;
  }
</script>

<svelte:window onclick={closeNotifs} />

<div class="min-h-screen flex flex-col">
  {#if !isAdmin}
    <nav class="border-b border-poke-border bg-poke-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a href="/" class="flex items-center gap-3 group flex-shrink-0">
            <img src="/squirtle.png" class="w-8 h-8 object-contain" alt="BenjaVerse" />
            <span class="font-display text-xs text-white group-hover:text-poke-accent transition-colors tracking-wider">
              BenjaVerse
            </span>
          </a>

          <!-- Desktop links -->
          <div class="hidden md:flex items-center gap-4">
            <a href="/" class="text-sm text-gray-400 hover:text-white transition-colors">Inicio</a>
            <a href="/news" class="text-sm text-gray-400 hover:text-white transition-colors">Noticias</a>
            <a href="/tournaments" class="text-sm text-gray-400 hover:text-white transition-colors">Torneos</a>
            <a href="/teams" class="text-sm text-gray-400 hover:text-white transition-colors">Equipos</a>
            <a href="/players" class="text-sm text-gray-400 hover:text-white transition-colors">Jugadores</a>
            <a href="/wall" class="text-sm text-gray-400 hover:text-white transition-colors">Muro</a>
            {#if data.user}
              <a href="/my-team" class="text-sm text-gray-400 hover:text-white transition-colors">Mi Equipo</a>
              <a href="/profile/{data.user.username}" class="text-sm text-gray-400 hover:text-white transition-colors">Mi Perfil</a>
              <!-- Notification bell -->
              <div class="relative notif-dropdown">
                <button onclick={openNotifs} class="relative text-gray-400 hover:text-white transition-colors p-1">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {#if (data as any).unreadCount > 0}
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                      {(data as any).unreadCount > 9 ? '9+' : (data as any).unreadCount}
                    </span>
                  {/if}
                </button>
                {#if showNotifDropdown}
                  <div class="absolute right-0 top-full mt-2 w-80 bg-poke-surface border border-poke-border rounded-xl shadow-2xl z-50 notif-dropdown overflow-hidden">
                    <div class="px-4 py-3 border-b border-poke-border flex items-center justify-between">
                      <span class="text-sm font-semibold text-white">Notificaciones</span>
                      {#if notifList.length > 0}
                        <a href="/notifications" onclick={() => showNotifDropdown = false}
                           class="text-xs text-poke-accent hover:underline">Ver todas</a>
                      {/if}
                    </div>
                    {#if loadingNotifs}
                      <div class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</div>
                    {:else if notifList.length === 0}
                      <div class="px-4 py-6 text-center text-sm text-gray-500">Sin notificaciones</div>
                    {:else}
                      <div class="max-h-80 overflow-y-auto divide-y divide-poke-border/50">
                        {#each notifList.slice(0, 8) as n}
                          <a href={n.link || '/wall'} onclick={() => showNotifDropdown = false}
                             class="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors {n.read ? 'opacity-60' : ''}">
                            <div class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 {n.read ? 'bg-gray-600' : 'bg-poke-accent'}"></div>
                            <div class="min-w-0">
                              <p class="text-xs text-gray-300 leading-snug">{n.message}</p>
                              <p class="text-[11px] text-gray-500 mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </a>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
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

          <!-- Mobile right: notif bell + hamburger -->
          <div class="flex md:hidden items-center gap-2">
            {#if data.user}
              <div class="relative notif-dropdown">
                <button onclick={openNotifs} class="relative text-gray-400 hover:text-white transition-colors p-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {#if (data as any).unreadCount > 0}
                    <span class="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                      {(data as any).unreadCount > 9 ? '9+' : (data as any).unreadCount}
                    </span>
                  {/if}
                </button>
                {#if showNotifDropdown}
                  <div class="absolute right-0 top-full mt-2 w-72 bg-poke-surface border border-poke-border rounded-xl shadow-2xl z-50 notif-dropdown overflow-hidden">
                    <div class="px-4 py-3 border-b border-poke-border flex items-center justify-between">
                      <span class="text-sm font-semibold text-white">Notificaciones</span>
                      {#if notifList.length > 0}
                        <a href="/notifications" onclick={() => showNotifDropdown = false}
                           class="text-xs text-poke-accent hover:underline">Ver todas</a>
                      {/if}
                    </div>
                    {#if loadingNotifs}
                      <div class="px-4 py-6 text-center text-sm text-gray-500">Cargando...</div>
                    {:else if notifList.length === 0}
                      <div class="px-4 py-6 text-center text-sm text-gray-500">Sin notificaciones</div>
                    {:else}
                      <div class="max-h-72 overflow-y-auto divide-y divide-poke-border/50">
                        {#each notifList.slice(0, 8) as n}
                          <a href={n.link || '/wall'} onclick={() => showNotifDropdown = false}
                             class="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors {n.read ? 'opacity-60' : ''}">
                            <div class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 {n.read ? 'bg-gray-600' : 'bg-poke-accent'}"></div>
                            <div class="min-w-0">
                              <p class="text-xs text-gray-300 leading-snug">{n.message}</p>
                              <p class="text-[11px] text-gray-500 mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </a>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
            <!-- Hamburger button -->
            <button
              onclick={() => mobileMenuOpen = !mobileMenuOpen}
              class="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Menú"
            >
              {#if mobileMenuOpen}
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              {:else}
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              {/if}
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile menu drawer -->
      {#if mobileMenuOpen}
        <div class="md:hidden border-t border-poke-border bg-poke-surface/95 backdrop-blur-sm">
          <div class="px-4 py-4 space-y-1">
            <a href="/" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              🏠 Inicio
            </a>
            <a href="/news" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              📰 Noticias
            </a>
            <a href="/tournaments" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              🏆 Torneos
            </a>
            <a href="/teams" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              🎮 Equipos
            </a>
            <a href="/players" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              👥 Jugadores
            </a>
            <a href="/wall" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              📝 Muro
            </a>
            <div class="border-t border-poke-border my-2"></div>
            {#if data.user}
              <a href="/my-team" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                ⚔️ Mi Equipo
              </a>
              <a href="/profile/{data.user.username}" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                👤 Mi Perfil
              </a>
              <a href="/notifications" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                🔔 Notificaciones
                {#if (data as any).unreadCount > 0}
                  <span class="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{(data as any).unreadCount}</span>
                {/if}
              </a>
              <button onclick={userLogout} class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left">
                🚪 @{data.user.username} · Salir
              </button>
            {:else}
              <a href="/login" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-poke-accent hover:bg-poke-accent/10 transition-colors font-medium">
                Iniciar sesión
              </a>
            {/if}
            <div class="border-t border-poke-border my-2"></div>
            <a href="/admin" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              🔒 Admin
            </a>
          </div>
        </div>
      {/if}
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
