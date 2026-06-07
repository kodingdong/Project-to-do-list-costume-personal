<!--
  Quotes Page — Manajemen Motivation Quotes (Tahap 3)
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { resolveRoute } from '$app/paths';

	import type { Quote } from '$lib/types';
	import { addToast } from '$lib/stores/toast';

	let quotes = $state<Quote[]>([]);
	let isLoading = $state(true);
	let isSubmitting = $state(false);

	let newContent = $state('');
	let newCategory = $state('motivasi');

	const categories = ['finansial', 'coding', 'motivasi', 'public speaking', 'bahasa inggris'];

	async function fetchQuotes() {
		try {
			isLoading = true;
			const res = await fetch('/api/quotes');
			const data = res.ok ? await res.json() : null;
			const error = !res.ok;
			if (!error) quotes = (data as Quote[]) || [];
		} finally {
			isLoading = false;
		}
	}

	async function addQuote() {
		if (!newContent.trim() || isSubmitting) return;
		isSubmitting = true;
		try {
			const res = await fetch('/api/quotes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: newContent.trim(),
					category: newCategory
				})
			});
			const error = !res.ok;

			if (!error) {
				newContent = '';
				await fetchQuotes();
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function deleteQuote(id: string) {
		const oldQuotes = [...quotes];
		
		// Optimistic update
		quotes = quotes.filter((q) => q.id !== id);
		
		const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
		const error = !res.ok;
		
		if (error) {
			quotes = oldQuotes;
			addToast('Gagal menghapus quote. Silakan coba lagi.', 'error');
		}
	}

	$effect(() => {
		if ($page.data?.user) fetchQuotes();
		else isLoading = false;
	});
</script>

<svelte:head>
	<title>Quotes — FlowDo</title>
</svelte:head>

<div class="quotes-page animate-fade-in">
	<div class="header">
		<a href={resolveRoute('/notes')} class="btn btn-ghost btn-sm back-btn">← Kembali</a>
		<h1 class="page-title">✨ Quotes</h1>
		<p class="page-sub">Koleksi kutipan motivasi yang akan muncul acak di aplikasi.</p>
	</div>

	<!-- Add Quote Form -->
	<div class="add-form glass-card">
		<div class="form-group">
			<label for="quote-content" class="form-label">Kutipan</label>
			<textarea
				id="quote-content"
				class="input textarea"
				placeholder="Tulis kutipan yang menginspirasimu..."
				bind:value={newContent}
				rows="3"
			></textarea>
		</div>

		<div class="form-row">
			<div class="form-group flex-1">
				<label for="quote-category" class="form-label">Kategori</label>
				<select id="quote-category" class="input select" bind:value={newCategory}>
					{#each categories as cat (cat)}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>
			<button
				class="btn btn-primary submit-btn"
				onclick={addQuote}
				disabled={!newContent.trim() || isSubmitting}
			>
				{#if isSubmitting}
					<span class="spinner"></span>
				{:else}
					Simpan Quote
				{/if}
			</button>
		</div>
	</div>

	<!-- Quotes List -->
	<div class="quotes-grid">
		{#if isLoading}
			<div class="skel"></div>
			<div class="skel"></div>
			<div class="skel"></div>
		{:else if !$page.data?.user}
			<div class="empty-state glass-card">
				<p>Login untuk mengelola quotes.</p>
			</div>
		{:else if quotes.length === 0}
			<div class="empty-state glass-card">
				<span class="empty-icon">📜</span>
				<p>Belum ada kutipan.</p>
				<p class="desc">Tambahkan kutipan pertamamu untuk mulai membangun motivasi!</p>
			</div>
		{:else}
			{#each quotes as quote (quote.id)}
				<div class="quote-card glass-card">
					<p class="quote-text">"{quote.content}"</p>
					<div class="quote-footer">
						<span class="badge badge-info">{quote.category}</span>
						<button
							class="btn-icon btn-danger note-del"
							onclick={() => deleteQuote(quote.id)}
							title="Hapus"
						>
							✕
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.quotes-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 800px;
		margin: 0 auto;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
	}

	.back-btn {
		margin-bottom: 8px;
		padding: 4px 8px;
	}

	.add-form {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-row {
		display: flex;
		gap: 16px;
		align-items: flex-end;
	}

	.flex-1 {
		flex: 1;
	}

	.form-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.textarea {
		resize: vertical;
		min-height: 80px;
	}

	.select {
		appearance: none;
		cursor: pointer;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b6b8d' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 32px;
		text-transform: capitalize;
	}

	.submit-btn {
		height: 42px; /* Setara dengan tinggi input */
		padding: 0 24px;
	}

	.quotes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
	}

	.quote-card {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		justify-content: space-between;
	}

	.quote-text {
		font-size: 15px;
		font-style: italic;
		line-height: 1.6;
		color: var(--text-primary);
	}

	.quote-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--border-subtle);
		padding-top: 12px;
	}

	.badge-info {
		background: rgba(78, 205, 196, 0.15);
		color: var(--accent-info);
		text-transform: capitalize;
	}

	.note-del {
		opacity: 0.5;
		font-size: 14px;
		transition: opacity 0.2s;
	}

	.quote-card:hover .note-del {
		opacity: 1;
	}

	.empty-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
		gap: 8px;
	}

	.desc {
		font-size: 13px;
		color: var(--text-muted);
	}

	@media (max-width: 600px) {
		.form-row {
			flex-direction: column;
			align-items: stretch;
		}

		.submit-btn {
			width: 100%;
		}
	}
</style>
