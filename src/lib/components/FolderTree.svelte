<script lang="ts">
	import type { Folder } from '$lib/types';
	
	let { folders, onSelect, selectedId } = $props<{
		folders: Folder[];
		onSelect: (id: string | null) => void;
		selectedId: string | null;
	}>();

	let paraCategories = ['project', 'area', 'resource', 'archive'] as const;
	let expanded = $state<Record<string, boolean>>({
		project: true,
		area: true,
		resource: true,
		archive: true
	});

	function toggle(paraType: string) {
		expanded[paraType] = !expanded[paraType];
	}
</script>

<div class="folder-tree">
	<button 
		class="all-notes-btn" 
		class:active={!selectedId} 
		onclick={() => onSelect(null)}
	>
		🧠 Semua Notes
	</button>

	{#each paraCategories as category}
		{@const catFolders = folders.filter((f: Folder) => f.para_type === category)}
		<div class="para-section">
			<button class="para-header" onclick={() => toggle(category)}>
				<span class="chevron">{expanded[category] ? '▼' : '▶'}</span>
				<span class="cat-name">{category.toUpperCase()}</span>
			</button>
			
			{#if expanded[category]}
				<div class="para-items">
					{#if catFolders.length === 0}
						<div class="empty-text">Kosong</div>
					{/if}
					{#each catFolders as folder (folder.id)}
						<button 
							class="folder-item"
							class:active={selectedId === folder.id}
							onclick={() => onSelect(folder.id)}
						>
							<span class="icon">{folder.icon || '📁'}</span>
							<span class="name">{folder.name}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.folder-tree {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.all-notes-btn {
		text-align: left;
		padding: 8px 12px;
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		font-weight: 600;
		color: var(--text-primary);
		cursor: pointer;
		transition: background var(--transition-fast);
	}
	.all-notes-btn:hover { background: rgba(108, 99, 255, 0.05); }
	.all-notes-btn.active { background: rgba(108, 99, 255, 0.1); color: var(--accent-primary); }

	.para-section { display: flex; flex-direction: column; gap: 4px; }
	.para-header {
		display: flex; align-items: center; gap: 6px;
		background: none; border: none; cursor: pointer;
		padding: 6px 12px; color: var(--text-muted); font-size: 11px; font-weight: 700;
		letter-spacing: 0.5px;
	}
	.para-header:hover { color: var(--text-secondary); }
	
	.para-items { display: flex; flex-direction: column; gap: 2px; padding-left: 20px; }
	.empty-text { font-size: 11px; color: var(--text-muted); padding: 4px 8px; font-style: italic; }
	
	.folder-item {
		display: flex; align-items: center; gap: 8px;
		background: none; border: none; text-align: left;
		padding: 6px 8px; border-radius: var(--radius-sm);
		cursor: pointer; font-size: 13px; color: var(--text-secondary);
		transition: all var(--transition-fast);
	}
	.folder-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
	.folder-item.active { background: rgba(108, 99, 255, 0.15); color: var(--text-primary); font-weight: 600; }
</style>
