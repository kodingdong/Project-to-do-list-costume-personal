<!--
  +page.svelte — Halaman utama: Emergency Inbox
-->
<script lang="ts">
	import QuickCapture from '$lib/components/QuickCapture.svelte';
	import { api } from '$lib/eden';
	import { page } from '$app/stores';
	import { resolveRoute } from '$app/paths';

	// Define the expected shape of our inbox item based on the API schema
	interface InboxItem {
		id: string;
		user_id: string;
		content: string;
		type: string;
		created_at: string;
	}

	let items = $state<InboxItem[]>([]);
	let isLoading = $state(true);
	let userData = $derived($page.data?.user);

	async function fetchItems() {
		if (!userData) {
			isLoading = false;
			return;
		}
		try {
			isLoading = true;
			const { data, error } = await api.api.inbox.get({
				headers: { Authorization: `Bearer ${$page.data?.session?.access_token || ''}` }
			});
			if (!error) items = (data as InboxItem[]) || [];
		} catch {
			/* silently fail */
		} finally {
			isLoading = false;
		}
	}

	async function deleteItem(id: string) {
		await api.api.inbox({ id }).delete({
			headers: { Authorization: `Bearer ${$page.data?.session?.access_token || ''}` }
		});
		items = items.filter((item) => item.id !== id);
	}

	function timeAgo(d: string): string {
		const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
		if (m < 1) return 'Baru saja';
		if (m < 60) return `${m}m lalu`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}j lalu`;
		return `${Math.floor(h / 24)}h lalu`;
	}

	$effect(() => {
		if (userData) fetchItems();
		else isLoading = false;
	});
</script>

<svelte:head>
	<title>Inbox — FlowDo</title>
</svelte:head>

<div class="inbox-page">
	<div class="page-header animate-fade-in">
		<h1 class="page-title">📥 Inbox</h1>
		<p class="page-sub">Tangkap ide sebelum hilang. Proses nanti.</p>
	</div>

	<QuickCapture onItemAdded={fetchItems} />

	<div class="items-section">
		<div class="sec-head">
			<h2 class="sec-title">Daftar Capture</h2>
			{#if items.length > 0}<span class="badge badge-primary">{items.length}</span>{/if}
		</div>

		{#if isLoading}
			<div class="skeletons">
				<div class="skel"></div>
				<div class="skel"></div>
				<div class="skel"></div>
			</div>
		{:else if !userData}
			<div class="empty glass-card">
				<span class="empty-ico">🔒</span>
				<p class="empty-t">Login untuk mulai</p>
				<a href={resolveRoute('/login', {})} class="btn btn-primary">Login</a>
			</div>
		{:else if items.length === 0}
			<div class="empty glass-card">
				<span class="empty-ico">🎯</span>
				<p class="empty-t">Inbox kosong!</p>
				<p class="empty-d">Tangkap ide pertamamu di atas.</p>
			</div>
		{:else}
			<div class="items-list">
				{#each items as item, i (item.id)}
					<div class="inbox-item glass-card animate-fade-in" style="animation-delay:{i * 50}ms">
						<div class="item-body">
							<div class="item-meta">
								<span
									class="badge"
									class:badge-primary={item.type === 'text'}
									class:badge-success={item.type === 'audio'}
								>
									{item.type === 'audio' ? '🎙️ Audio' : '✏️ Text'}
								</span>
								<span class="item-time">{timeAgo(item.created_at)}</span>
							</div>
							<p class="item-text">{item.content}</p>
						</div>
						<button
							class="btn btn-icon btn-danger del-btn"
							onclick={() => deleteItem(item.id)}
							title="Hapus">🗑️</button
						>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.inbox-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.page-header {
		margin-bottom: 4px;
	}
	.page-title {
		font-size: 24px;
		font-weight: 800;
		margin-bottom: 4px;
	}
	.page-sub {
		font-size: 14px;
		color: var(--text-secondary);
	}
	.items-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.sec-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
	}
	.sec-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-secondary);
	}
	.skeletons {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.skel {
		height: 72px;
		background: linear-gradient(
			90deg,
			var(--bg-card) 25%,
			var(--bg-card-hover) 50%,
			var(--bg-card) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: var(--radius-lg);
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 40px 24px;
		text-align: center;
	}
	.empty-ico {
		font-size: 40px;
	}
	.empty-t {
		font-size: 16px;
		font-weight: 700;
	}
	.empty-d {
		font-size: 13px;
		color: var(--text-secondary);
	}
	.items-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.inbox-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
	}
	.item-body {
		flex: 1;
		min-width: 0;
	}
	.item-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}
	.item-time {
		font-size: 11px;
		color: var(--text-muted);
	}
	.item-text {
		font-size: 14px;
		line-height: 1.5;
		word-break: break-word;
	}
	.del-btn {
		flex-shrink: 0;
		font-size: 16px;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}
	.inbox-item:hover .del-btn {
		opacity: 1;
	}
</style>
