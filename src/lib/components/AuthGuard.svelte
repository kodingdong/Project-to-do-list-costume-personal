<!--
  AuthGuard.svelte — Proteksi halaman yang butuh login

  Jika user belum terautentikasi, redirect ke /login.
  Jika sudah login, tampilkan konten (children).
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	import { resolveRoute } from '$app/paths';

	let { children }: { children: Snippet } = $props();

	// Ambil data user dari page data
	let userData = $derived($page.data?.user);

	$effect(() => {
		if (!userData && $page.url.pathname !== '/login') {
			goto(resolveRoute('/login', {}));
		}
	});
</script>

{#if userData}
	{@render children()}
{:else}
	<div class="loading-screen">
		<div class="loading-spinner"></div>
		<p>Memuat...</p>
	</div>
{/if}

<style>
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		gap: 16px;
		color: var(--text-secondary);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border-subtle);
		border-top-color: var(--accent-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
