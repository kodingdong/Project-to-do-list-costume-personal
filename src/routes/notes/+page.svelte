<!-- Notes — Placeholder page (Tahap 3) -->
<script lang="ts">
</script>

<svelte:head><title>Notes — FlowDo</title></svelte:head>

<div class="placeholder-page animate-fade-in">
	<h1 class="page-title">📝 Notes</h1>
	<p class="page-sub">Notion-style notes dengan TipTap editor.</p>
	<div class="coming-soon glass-card">
		<span class="cs-icon">🚧</span>
		<p class="cs-title">Coming Soon — Tahap 3</p>
		<p class="cs-desc">Fitur notes akan diimplementasikan di minggu ketiga.</p>
	</div>
</div>

<style>
	.placeholder-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.page-title {
		font-size: 24px;
		font-weight: 800;
	}
	.page-sub {
		font-size: 14px;
		color: var(--text-secondary);
	}
	.coming-soon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 48px 24px;
		text-align: center;
	}
	.cs-icon {
		font-size: 48px;
	}
	.cs-title {
		font-size: 18px;
		font-weight: 700;
	}
	.cs-desc {
		font-size: 13px;
		color: var(--text-secondary);
	}
</style>
