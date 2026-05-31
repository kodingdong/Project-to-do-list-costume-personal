<!--
  Notes Page — Manajemen catatan dengan TipTap Block Editor
-->
<script lang="ts">
	import { api } from '$lib/eden';
	import { page } from '$app/stores';
	import BlockEditor from '$lib/components/BlockEditor.svelte';
	import MotivationWidget from '$lib/components/MotivationWidget.svelte';
	import { resolveRoute } from '$app/paths';

	interface Note {
		id: string;
		title: string;
		body: unknown;
		updated_at: string;
	}

	let notes = $state<Note[]>([]);
	let isLoading = $state(true);
	let selectedNote = $state<Note | null>(null);

	// State form note baru
	let newTitle = $state('');
	let isAdding = $state(false);

	let accessToken = $derived($page.data?.session?.access_token || '');

	function headers() {
		return { Authorization: `Bearer ${accessToken}` };
	}

	async function fetchNotes() {
		try {
			isLoading = true;
			const { data, error } = await api.api.notes.get({ headers: headers() });
			if (!error) {
				notes = (data as Note[]) || [];
				// Auto-select note pertama jika tidak ada yang dipilih
				if (!selectedNote && notes.length > 0) {
					selectedNote = notes[0];
				}
			}
		} finally {
			isLoading = false;
		}
	}

	async function addNote() {
		if (!newTitle.trim() || isAdding) return;
		isAdding = true;
		try {
			const { data, error } = await api.api.notes.post(
				{ title: newTitle.trim(), body: {} },
				{ headers: headers() }
			);
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
		const { error } = await api.api.notes({ id }).delete({ headers: headers() });
		if (!error) {
			notes = notes.filter((n) => n.id !== id);
			if (selectedNote?.id === id) {
				selectedNote = notes.length > 0 ? notes[0] : null;
			}
		}
	}

	async function saveNoteContent(json: unknown) {
		if (!selectedNote) return;

		// Optimistic UI
		selectedNote.body = json;

		const { error } = await api.api
			.notes({ id: selectedNote.id })
			.put({ body: json }, { headers: headers() });

		if (!error) {
			// Update daftar notes tanpa perlu fetch ulang semua (hanya update_at)
			selectedNote.updated_at = new Date().toISOString();
			notes = [...notes]; // Memicu reaktivitas
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addNote();
		}
	}

	$effect(() => {
		if ($page.data?.user) fetchNotes();
		else isLoading = false;
	});
</script>

<svelte:head>
	<title>Notes — FlowDo</title>
</svelte:head>

<div class="notes-layout">
	<!-- Sidebar: Daftar Notes -->
	<aside class="notes-sidebar glass-card">
		<div class="sidebar-header">
			<h2 class="sidebar-title">📝 Notes</h2>
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
		</div>

		<div class="notes-list">
			{#if isLoading}
				<div class="skel"></div>
				<div class="skel"></div>
			{:else if !$page.data?.user}
				<div class="empty-state">
					<p>Login untuk melihat notes.</p>
					<a href={resolveRoute('/login', {})} class="btn btn-primary btn-sm mt-2">Login</a>
				</div>
			{:else if notes.length === 0}
				<div class="empty-state">
					<p>Belum ada catatan.</p>
				</div>
			{:else}
				{#each notes as note (note.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="note-item"
						class:active={selectedNote?.id === note.id}
						onclick={() => (selectedNote = note)}
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

		<!-- Motivation Widget diletakkan di bawah sidebar -->
		<div class="widget-wrapper">
			<MotivationWidget />
			<a href={resolveRoute('/notes/quotes', {})} class="btn btn-ghost btn-sm full-w mt-2"
				>Kelola Quotes →</a
			>
		</div>
	</aside>

	<!-- Main Area: Editor -->
	<main class="notes-main">
		{#if selectedNote}
			<div class="editor-header animate-fade-in">
				<h1 class="main-title">{selectedNote.title}</h1>
				<p class="main-meta">
					Terakhir diubah: {new Date(selectedNote.updated_at).toLocaleString('id-ID')}
				</p>
			</div>
			<!-- BlockEditor dirender ulang ketika selectedNote berubah (menggunakan {#key}) -->
			{#key selectedNote.id}
				<div class="animate-fade-in">
					<BlockEditor content={selectedNote.body} onsave={saveNoteContent} />
				</div>
			{/key}
		{:else if !isLoading && $page.data?.user}
			<div class="empty-editor glass-card animate-fade-in">
				<span class="empty-icon">✍️</span>
				<h2>Pilih atau buat catatan baru</h2>
				<p>Catatanmu tersimpan otomatis dan format menggunakan blok (mirip Notion).</p>
			</div>
		{/if}
	</main>
</div>

<style>
	.notes-layout {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 20px;
		align-items: start;
		height: calc(100vh - 180px); /* Menyesuaikan dengan tinggi layar */
	}

	@media (max-width: 768px) {
		.notes-layout {
			grid-template-columns: 1fr;
			height: auto;
		}

		.notes-sidebar {
			max-height: 300px;
		}
	}

	/* Sidebar */
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
	}

	.sidebar-title {
		font-size: 18px;
		font-weight: 700;
		margin-bottom: 12px;
	}

	.add-note-box {
		display: flex;
		gap: 8px;
	}

	.input-sm {
		padding: 6px 12px;
		font-size: 13px;
	}

	.btn-sm {
		padding: 6px 12px;
		font-size: 13px;
	}

	.notes-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.note-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		border: 1px solid transparent;
	}

	.note-item:hover {
		background: rgba(108, 99, 255, 0.05);
	}

	.note-item.active {
		background: rgba(108, 99, 255, 0.1);
		border-color: rgba(108, 99, 255, 0.2);
	}

	.note-info {
		flex: 1;
		min-width: 0;
	}

	.note-title {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.note-date {
		font-size: 11px;
		color: var(--text-muted);
	}

	.note-del {
		opacity: 0;
		font-size: 12px;
		padding: 4px 8px;
	}

	.note-item:hover .note-del {
		opacity: 1;
	}

	.widget-wrapper {
		padding: 16px;
		border-top: 1px solid var(--border-subtle);
	}

	/* Main Area */
	.notes-main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		height: 100%;
		min-width: 0;
	}

	.editor-header {
		padding: 0 4px;
	}

	.main-title {
		font-size: 24px;
		font-weight: 800;
		margin-bottom: 4px;
	}

	.main-meta {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.empty-editor {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		padding: 40px;
		gap: 12px;
	}

	.empty-icon {
		font-size: 48px;
	}

	.empty-state {
		text-align: center;
		padding: 20px;
		color: var(--text-muted);
		font-size: 13px;
	}

	.skel {
		height: 50px;
		background: var(--bg-input);
		border-radius: var(--radius-sm);
		animation: shimmer 1.5s infinite;
	}

	.full-w {
		width: 100%;
	}

	.mt-2 {
		margin-top: 8px;
	}
</style>
