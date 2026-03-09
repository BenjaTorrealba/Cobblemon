<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let { data, children } = $props();

  const isLoginPage = $derived($page.url.pathname === '/admin/login');

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    goto('/admin/login');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '⊞' },
    { href: '/admin/tournaments', label: 'Torneos', icon: '🏆' },
    { href: '/admin/players', label: 'Jugadores', icon: '👥' },
    { href: '/admin/matches', label: 'Enfrentamientos', icon: '⚔' },
    { href: '/admin/news', label: 'Noticias', icon: '📢' },
    { href: '/admin/users', label: 'Usuarios', icon: '🔑' },
  ];
</script>

{#if isLoginPage}
  {@render children()}
{:else}
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-poke-surface border-r border-poke-border flex flex-col fixed inset-y-0 left-0 z-40">
      <!-- Logo -->
      <div class="p-6 border-b border-poke-border">
        <a href="/" class="flex items-center gap-3 mb-1">
          <div class="w-8 h-8 bg-gradient-to-br from-poke-accent to-poke-blue rounded-lg flex items-center justify-center text-sm">
            ⚔
          </div>
          <span class="font-display text-xs text-white tracking-wider">BenjaVerse</span>
        </a>
        <div class="text-xs text-gray-500 pl-11">Panel Admin</div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-4 space-y-1">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
            {$page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/admin')
              ? 'bg-poke-accent/20 text-poke-accent border border-poke-accent/30'
              : 'text-gray-400 hover:text-white hover:bg-poke-surface2'}"
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        {/each}
      </nav>

      <!-- User info -->
      <div class="p-4 border-t border-poke-border">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-400 font-medium">{data.admin?.username}</div>
            <div class="text-xs text-gray-600">Administrador</div>
          </div>
          <button onclick={logout} class="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-900/20">
            Salir
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 ml-64">
      <header class="bg-poke-surface border-b border-poke-border px-8 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">
            {navItems.find(n => $page.url.pathname === n.href || ($page.url.pathname.startsWith(n.href) && n.href !== '/admin'))?.label ?? 'Panel Admin'}
          </h1>
        </div>
        <a href="/" class="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Ver sitio público
        </a>
      </header>
      <div class="p-8">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
