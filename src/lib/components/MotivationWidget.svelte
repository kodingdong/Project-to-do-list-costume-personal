<!--
  MotivationWidget — Widget Kutipan Dinamis (Tahap 3)
-->
<script lang="ts">
	import { api } from '$lib/eden';
	import { page } from '$app/stores';

	let quote = $state<{ content: string; category: string | null } | null>(null);
	let isLoading = $state(true);

	$effect(() => {
		async function fetchRandomQuote() {
			const token = $page.data?.session?.access_token;
			if (!token) {
				isLoading = false;
				return;
			}

			try {
				const { data, error } = await api.api.quotes.get({
					headers: { Authorization: `Bearer ${token}` }
				});

				if (!error && Array.isArray(data) && data.length > 0) {
					// Pilih acak 1 kutipan
					const randomIndex = Math.floor(Math.random() * data.length);
					quote = data[randomIndex];
				}
			} catch {
				// Silently fail
			} finally {
				isLoading = false;
			}
		}

		fetchRandomQuote();
	});
</script>

<div class="motivation-widget glass-card animate-fade-in">
	{#if isLoading}
		<div class="skel"></div>
	{:else if quote}
		<p class="quote-text">"{quote.content}"</p>
		{#if quote.category}
			<span class="quote-category badge badge-info">{quote.category}</span>
		{/if}
	{:else}
		<p class="quote-text empty">"Masa depan dibentuk oleh apa yang kamu lakukan hari ini."</p>
		<p class="quote-desc">Tambahkan kutipan motivasimu di menu Quotes!</p>
	{/if}
</div>

<style>
	.motivation-widget {
		padding: 20px 24px;
		background: linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(78, 205, 196, 0.08) 100%);
		border-color: rgba(108, 99, 255, 0.2);
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: center;
		text-align: center;
		border-radius: var(--radius-lg);
	}

	.quote-text {
		font-size: 16px;
		font-style: italic;
		font-weight: 600;
		line-height: 1.5;
		color: var(--text-primary);
	}

	.quote-text.empty {
		color: var(--text-secondary);
	}

	.quote-category {
		font-size: 11px;
		align-self: center;
	}

	.quote-desc {
		font-size: 13px;
		color: var(--text-muted);
	}

	.skel {
		width: 100%;
		height: 40px;
		background: var(--bg-input);
		border-radius: var(--radius-sm);
		animation: shimmer 1.5s infinite;
	}

	/* Badge variants */
	.badge-info {
		background: rgba(78, 205, 196, 0.15);
		color: var(--accent-info);
	}
</style>
