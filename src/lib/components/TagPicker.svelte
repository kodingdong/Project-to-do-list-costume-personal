<script lang="ts">
	import type { Tag } from '$lib/types';
	
	let { availableTags, selectedTagIds, onToggleTag } = $props<{
		availableTags: Tag[];
		selectedTagIds: string[];
		onToggleTag: (tagId: string) => void;
	}>();
</script>

<div class="tag-picker">
	<div class="tags-header">Tags</div>
	<div class="tags-list">
		{#if availableTags.length === 0}
			<div class="empty-text">Belum ada tag</div>
		{/if}
		{#each availableTags as tag (tag.id)}
			<button 
				class="tag-pill" 
				class:active={selectedTagIds.includes(tag.id)}
				onclick={() => onToggleTag(tag.id)}
			>
				<span class="tag-color" style="background-color: {tag.color || '#6c63ff'}"></span>
				<span class="tag-name">#{tag.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.tag-picker { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; border-top: 1px solid var(--border-subtle); padding-top: 16px; }
	.tags-header { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; padding: 0 12px; }
	.tags-list { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px; }
	.empty-text { font-size: 11px; color: var(--text-muted); font-style: italic; }
	.tag-pill {
		display: flex; align-items: center; gap: 4px;
		background: var(--bg-input); border: 1px solid var(--border-subtle);
		padding: 4px 10px; border-radius: 12px;
		font-size: 11px; font-weight: 500; color: var(--text-secondary);
		cursor: pointer; transition: all var(--transition-fast);
	}
	.tag-pill:hover { background: var(--bg-elevated); border-color: var(--accent-primary); }
	.tag-pill.active { background: rgba(108, 99, 255, 0.15); border-color: var(--accent-primary); color: var(--accent-primary); }
	.tag-color { width: 6px; height: 6px; border-radius: 50%; }
</style>
