<!--
  +layout.svelte — Layout utama dengan bottom navigation (mobile-first)

  Menu: 📥 Inbox, ✅ Tasks, 🔥 Habits, 📝 Notes
  Header: Logo + tombol logout
  Highlight menu aktif berdasarkan $page.url.pathname
-->
<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { resolveRoute } from '$app/paths';
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import { startReminders, stopReminders } from '$lib/utils/reminder';

	let { children }: { children: Snippet } = $props();

	// Data dari layout load
	let userData = $derived($page.data?.user);
	let accessToken = $derived($page.data?.session?.access_token || '');

	// Navigasi items
	const navItems = [
		{ href: '/', icon: '📥', label: 'Inbox' },
		{ href: '/tasks', icon: '✅', label: 'Tasks' },
		{ href: '/habits', icon: '🔥', label: 'Habits' },
		{ href: '/notes', icon: '📝', label: 'Notes' }
	];

	// Cek apakah menu aktif
	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		if (href === '/') return path === '/';
		return path.startsWith(href);
	}

	// Logout
	async function handleLogout() {
		stopReminders();
		const supabase = $page.data?.supabase;
		if (supabase) {
			await supabase.auth.signOut();
			window.location.href = '/login';
		}
	}

	// Halaman yang tidak perlu nav
	let showNav = $derived($page.url.pathname !== '/login');

	// Aktifkan reminder system saat user login
	$effect(() => {
		if (browser && userData && accessToken) {
			startReminders(accessToken);
		}
		return () => {
			if (browser) stopReminders();
		};
	});
</script>

{#if showNav && userData}
	<!-- Header -->
	<header class="app-header">
		<div class="header-content">
			<a href={resolveRoute('/', {})} class="logo">
				<span class="logo-icon">⚡</span>
				<span class="logo-text">FlowDo</span>
			</a>

			<div class="header-actions">
				<span class="user-greeting">Hai, {userData.email?.split('@')[0] || 'User'}</span>
				<button
					class="btn btn-ghost btn-icon"
					onclick={handleLogout}
					title="Logout"
					id="logout-btn"
				>
					🚪
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="app-main">
		{@render children()}
	</main>

	<!-- Bottom Navigation -->
	<nav class="bottom-nav" id="bottom-navigation">
		{#each navItems as item (item.href)}
			<a
				href={resolveRoute(item.href, {})}
				class="nav-item"
				class:active={isActive(item.href)}
				id="nav-{item.label.toLowerCase()}"
			>
				<span class="nav-icon">{item.icon}</span>
				<span class="nav-label">{item.label}</span>
				{#if isActive(item.href)}
					<span class="nav-indicator"></span>
				{/if}
			</a>
		{/each}
	</nav>
{:else}
	<!-- No nav (login page atau belum login) -->
	{@render children()}
{/if}

<style>
	/* ===== Header ===== */
	.app-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--header-height);
		background: rgba(15, 15, 35, 0.85);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--border-subtle);
		z-index: 100;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		max-width: 640px;
		margin: 0 auto;
		padding: 0 16px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: var(--text-primary);
	}

	.logo-icon {
		font-size: 22px;
	}

	.logo-text {
		font-size: 18px;
		font-weight: 800;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.user-greeting {
		font-size: 13px;
		color: var(--text-secondary);
		display: none;
	}

	@media (min-width: 480px) {
		.user-greeting {
			display: block;
		}
	}

	/* ===== Main Content ===== */
	.app-main {
		max-width: 640px;
		margin: 0 auto;
		padding: calc(var(--header-height) + 16px) 16px calc(var(--nav-height) + 16px);
		min-height: 100dvh;
	}

	/* ===== Bottom Navigation ===== */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: var(--nav-height);
		background: rgba(15, 15, 35, 0.9);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-top: 1px solid var(--border-subtle);
		display: flex;
		align-items: center;
		justify-content: space-around;
		z-index: 100;
		padding-bottom: env(safe-area-inset-bottom, 0);
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		text-decoration: none;
		color: var(--text-muted);
		padding: 8px 16px;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		position: relative;
		min-width: 64px;
	}

	.nav-item:hover {
		color: var(--text-secondary);
		background: rgba(108, 99, 255, 0.05);
	}

	.nav-item.active {
		color: var(--accent-primary);
	}

	.nav-icon {
		font-size: 22px;
		line-height: 1;
	}

	.nav-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.3px;
	}

	.nav-indicator {
		position: absolute;
		top: -1px;
		left: 50%;
		transform: translateX(-50%);
		width: 24px;
		height: 3px;
		background: var(--gradient-primary);
		border-radius: 0 0 var(--radius-full) var(--radius-full);
	}
</style>
