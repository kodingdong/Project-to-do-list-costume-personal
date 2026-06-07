<!--
  Notes Page — Manajemen catatan dengan TipTap Block Editor & Second Brain
-->
<script lang="ts">
	import { page } from '$app/stores';
	import BlockEditor from '$lib/components/BlockEditor.svelte';
	import FolderTree from '$lib/components/FolderTree.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import TagPicker from '$lib/components/TagPicker.svelte';
	import { resolveRoute } from '$app/paths';

	import type { Note, Folder, Tag } from '$lib/types';
	import { addToast } from '$lib/stores/toast';

	let notes = $state<Note[]>([]);
	let folders = $state<Folder[]>([]);
	let tags = $state<Tag[]>([]);
	let isLoading = $state(true);
	let selectedNote = $state<Note | null>(null);

	// Search & Filter State
	let searchQuery = $state('');
	let selectedFolderId = $state<string | null>(null);
	let selectedFilterTagIds = $state<string[]>([]);

	// State form note baru
	let newTitle = $state('');
	let isAdding = $state(false);

	async function fetchBrainData() {
		try {
			isLoading = true;
			const [fRes, tRes] = await Promise.all([
				fetch('/api/folders'),
				fetch('/api/tags')
			]);
			if (fRes.ok) folders = await fRes.json();
			if (tRes.ok) tags = await tRes.json();
			
			await performSearch();
		} finally {
			isLoading = false;
		}
	}

	async function performSearch() {
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.set('q', searchQuery);
			if (selectedFolderId) params.set('folder', selectedFolderId);
			if (selectedFilterTagIds.length > 0) params.set('tags', selectedFilterTagIds.join(','));

			const res = await fetch(`/api/search?${params.toString()}`);
			if (res.ok) {
				notes = await res.json();
				// Update selectedNote if the current one is filtered out
				if (selectedNote && !notes.find(n => n.id === selectedNote?.id)) {
					selectedNote = null;
				}
				if (!selectedNote && notes.length > 0) {
					selectedNote = notes[0];
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	function handleFolderSelect(folderId: string | null) {
		selectedFolderId = folderId;
		performSearch();
	}

	function toggleFilterTag(tagId: string) {
		if (selectedFilterTagIds.includes(tagId)) {
			selectedFilterTagIds = selectedFilterTagIds.filter((id) => id !== tagId);
		} else {
			selectedFilterTagIds = [...selectedFilterTagIds, tagId];
		}
		performSearch();
	}

	async function addNote() {
		if (!newTitle.trim() || isAdding) return;
		isAdding = true;
		try {
			const res = await fetch('/api/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					title: newTitle.trim(), 
					body: {},
					folder_id: selectedFolderId 
				})
			});
			const data = res.ok ? await res.json() : null;
			const error = !res.ok;
			if (!error && data) {
				newTitle = '';
				notes = [data as Note, ...notes];
				selectedNote = data as Note;
			}
		} finally {
			isAdding = false;
		}
	}

	async function deleteNote(id: string) {
		const oldNotes = [...notes];
		const oldSelected = selectedNote;

		notes = notes.filter((n) => n.id !== id);
		if (selectedNote?.id === id) {
			selectedNote = notes.length > 0 ? notes[0] : null;
		}

		const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
		if (!res.ok) {
			notes = oldNotes;
			selectedNote = oldSelected;
			addToast('Gagal menghapus catatan.', 'error');
		}
	}

	async function saveNoteContent(json: unknown) {
		if (!selectedNote) return;
		const oldBody = selectedNote.body;
		selectedNote.body = json;

		const res = await fetch(`/api/notes/${selectedNote.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ body: json })
		});
		if (!res.ok) {
			selectedNote.body = oldBody;
			addToast('Gagal menyimpan catatan.', 'error');
		} else {
			selectedNote.updated_at = new Date().toISOString();
			notes = [...notes];
		}
	}

	async function toggleNoteTag(tagId: string) {
		if (!selectedNote) return;
		const hasTag = selectedNote.note_tags?.some(nt => nt.tag_id === tagId);
		const oldNoteTags = selectedNote.note_tags || [];
		
		try {
			if (hasTag) {
				selectedNote.note_tags = oldNoteTags.filter(nt => nt.tag_id !== tagId);
				await fetch(`/api/notes/${selectedNote.id}/tags`, {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ tag_id: tagId })
				});
			} else {
				selectedNote.note_tags = [...oldNoteTags, { tag_id: tagId }];
				await fetch(`/api/notes/${selectedNote.id}/tags`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ tag_id: tagId })
				});
			}
			notes = [...notes]; // Memicu reaktivitas
		} catch (e) {
			selectedNote.note_tags = oldNoteTags;
			addToast('Gagal update tag', 'error');
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addNote();
		}
	}

	$effect(() => {
		if ($page.data?.user) fetchBrainData();
		else isLoading = false;
	});
</script>

<svelte:head>
	<title>Brain — FlowDo</title>
</svelte:head>

<div class="notes-layout">
	<!-- Sidebar: Second Brain Navigation -->
	<aside class="notes-sidebar glass-card">
		<div class="sidebar-header">
			<h2 class="sidebar-title">🧠 Second Brain</h2>
			<SearchBar bind:searchQuery onSearch={performSearch} />
		</div>

		<div class="sidebar-content">
			<FolderTree 
				folders={folders} 
				selectedId={selectedFolderId} 
				onSelect={handleFolderSelect} 
			/>

			<TagPicker 
				availableTags={tags} 
				selectedTagIds={selectedFilterTagIds} 
				onToggleTag={toggleFilterTag} 
			/>

			<div class="notes-list-section">
				<div class="section-title">Notes List</div>
				<div class="add-note-box">
					<input
						type="text"
						class="input input-sm"
						placeholder="Judul catatan baru..."
						bind:value={newTitle}
						onkeydown={handleKeydown}
					/>
					<button
						class="btn btn-primary btn-sm"
						onclick={addNote}
						disabled={!newTitle.trim() || isAdding}
					>
						＋
					</button>
				</div>

				<div class="notes-list">
					{#if isLoading}
						<div class="note-skel"></div>
						<div class="note-skel"></div>
					{:else if !$page.data?.user}
						<div class="empty-state">
							<a href={resolveRoute('/login')} class="btn btn-primary btn-sm mt-2">Login</a>
						</div>
					{:else if notes.length === 0}
						<div class="empty-state">Belum ada catatan.</div>
					{:else}
						{#each notes as note (note.id)}
							<div
								class="note-item"
								class:active={selectedNote?.id === note.id}
								onclick={() => (selectedNote = note)}
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && (selectedNote = note)}
							>
								<div class="note-info">
									<p class="note-title">{note.title}</p>
									<p class="note-date">
										{new Date(note.updated_at).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'short'
										})}
									</p>
								</div>
								<button
									class="btn-icon btn-danger note-del"
									onclick={(e) => {
										e.stopPropagation();
										deleteNote(note.id);
									}}
									title="Hapus"
								>
									✕
								</button>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Area: Editor -->
	<main class="notes-main">
		{#if selectedNote}
			<div class="editor-header animate-fade-in">
				<h1 class="main-title">{selectedNote.title}</h1>
				<div class="main-meta-row">
					<p class="main-meta">
						Terakhir diubah: {new Date(selectedNote.updated_at).toLocaleString('id-ID')}
					</p>
					{#if selectedNote.folders}
						<span class="folder-badge">📁 {selectedNote.folders.name}</span>
					{/if}
				</div>
				<TagPicker 
					availableTags={tags} 
					selectedTagIds={selectedNote.note_tags?.map(t => t.tag_id) || []} 
					onToggleTag={toggleNoteTag} 
				/>
			</div>
			{#key selectedNote.id}
				<div class="animate-fade-in editor-wrapper">
					<BlockEditor content={selectedNote.body} onsave={saveNoteContent} />
				</div>
			{/key}
		{:else if !isLoading && $page.data?.user}
			<div class="empty-editor glass-card animate-fade-in">
				<span class="empty-icon">🧠</span>
				<h2>Second Brain Anda</h2>
				<p>Pilih note dari daftar atau buat baru.</p>
			</div>
		{/if}
	</main>
</div>

<style>
	.notes-layout {
		display: grid;
		grid-template-columns: 320px 1fr;
		gap: 20px;
		align-items: start;
		height: calc(100vh - 180px);
	}

	@media (max-width: 768px) {
		.notes-layout {
			grid-template-columns: 1fr;
			height: auto;
		}
		.notes-sidebar {
			max-height: 400px;
		}
	}

	.notes-sidebar {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0;
		overflow: hidden;
	}

	.sidebar-header {
		padding: 16px;
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.sidebar-title {
		font-size: 18px;
		font-weight: 700;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 16px 8px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.notes-list-section {
		margin-top: 16px;
		border-top: 1px solid var(--border-subtle);
		padding-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.section-title {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 0 8px;
	}

	.add-note-box { display: flex; gap: 8px; padding: 0 8px; }
	.input-sm { padding: 6px 12px; font-size: 13px; flex: 1; }
	.btn-sm { padding: 6px 12px; font-size: 13px; }

	.notes-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.note-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		border: 1px solid transparent;
	}

	.note-item:hover { background: rgba(108, 99, 255, 0.05); }
	.note-item.active {
		background: rgba(108, 99, 255, 0.1);
		border-color: rgba(108, 99, 255, 0.2);
	}

	.note-info { flex: 1; min-width: 0; }
	.note-title {
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.note-date { font-size: 11px; color: var(--text-muted); }
	.note-del { opacity: 0; font-size: 12px; padding: 4px 8px; }
	.note-item:hover .note-del { opacity: 1; }

	/* Main Area */
	.notes-main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		height: 100%;
		min-width: 0;
	}

	.editor-header {
		padding: 0 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.main-title { font-size: 24px; font-weight: 800; }
	.main-meta-row { display: flex; align-items: center; gap: 12px; }
	.main-meta { font-size: 12px; color: var(--text-secondary); }
	.folder-badge { font-size: 11px; background: var(--bg-elevated); padding: 2px 8px; border-radius: 12px; color: var(--text-muted); }

	.editor-wrapper { flex: 1; overflow-y: auto; padding-top: 16px; }

	.empty-editor {
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		height: 100%; text-align: center; padding: 40px; gap: 12px;
	}
	.empty-icon { font-size: 48px; }
	.empty-state { text-align: center; padding: 20px; color: var(--text-muted); font-size: 12px; }
	.note-skel { height: 50px; background: var(--bg-input); border-radius: var(--radius-sm); animation: shimmer 1.5s infinite; }
</style>
