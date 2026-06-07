<script lang="ts">
	let { searchQuery = $bindable(''), onSearch } = $props<{
		searchQuery: string;
		onSearch: () => void;
	}>();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onSearch();
		}
	}
</script>

<div class="search-bar">
	<span class="search-icon">🔍</span>
	<input 
		type="text" 
		class="search-input" 
		placeholder="Cari notes..." 
		bind:value={searchQuery}
		onkeydown={handleKeydown}
	/>
	{#if searchQuery}
		<button class="clear-btn" onclick={() => { searchQuery = ''; onSearch(); }}>✕</button>
	{/if}
</div>

<style>
	.search-bar {
		display: flex;
		align-items: center;
		background: var(--bg-input);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		padding: 8px 12px;
		gap: 8px;
		transition: border-color var(--transition-fast);
	}
	.search-bar:focus-within {
		border-color: var(--accent-primary);
	}
	.search-icon {
		font-size: 14px;
		opacity: 0.5;
	}
	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--text-primary);
		font-size: 14px;
	}
	.clear-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 12px;
	}
	.clear-btn:hover {
		color: var(--text-primary);
	}
</style>
