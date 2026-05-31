<!--
  BlockEditor — TipTap Rich Text Editor (Tahap 3)

  Menggunakan Svelte 5.
  Mendukung format: Bold, Italic, H1/H2/H3, Bullet List.
  Output JSONB (bukan HTML) untuk struktur data yang lebih clean.
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	// Props menggunakan Svelte 5 syntax
	let { content = {}, onsave } = $props<{
		content?: unknown;
		onsave: (json: unknown) => void;
	}>();

	let element: HTMLElement;
	let editor: Editor | null = $state(null);
	let isDirty = $state(false);

	function isValidContent(c: unknown): boolean {
		return c !== null && typeof c === 'object' && Object.keys(c).length > 0;
	}

	onMount(() => {
		// PENTING: TipTap hanya boleh dijalankan di browser (client-side)
		if (!browser) return;

		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3]
					}
				})
			],
			content:
				isValidContent(content) ? content : '<p>Mulai menulis catatan di sini...</p>',
			editorProps: {
				attributes: {
					class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px]'
				}
			},
			onTransaction: () => {
				// Memaksa Svelte merender ulang reaktivitas untuk toolbar state
				editor = editor;
			},
			onUpdate: () => {
				isDirty = true;
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Mengekspos fungsi update ke luar (jika konten di-load asinkron)
	$effect(() => {
		if (editor && isValidContent(content) && !isDirty) {
			const currentJSON = editor.getJSON();
			// Cek kasar apakah konten berbeda (mencegah loop)
			if (JSON.stringify(currentJSON) !== JSON.stringify(content)) {
				editor.commands.setContent(content);
			}
		}
	});

	function handleSave() {
		if (editor) {
			onsave(editor.getJSON());
			isDirty = false;
		}
	}
</script>

<div class="editor-container glass-card">
	<!-- Toolbar -->
	{#if editor}
		<div class="toolbar">
			<!-- Bold -->
			<button
				class="toolbar-btn"
				class:active={editor.isActive('bold')}
				onclick={() => editor?.chain().focus().toggleBold().run()}
				title="Bold (Ctrl+B)"
			>
				<b>B</b>
			</button>

			<!-- Italic -->
			<button
				class="toolbar-btn"
				class:active={editor.isActive('italic')}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
				title="Italic (Ctrl+I)"
			>
				<i>I</i>
			</button>

			<div class="divider"></div>

			<!-- Headings -->
			<button
				class="toolbar-btn"
				class:active={editor.isActive('heading', { level: 1 })}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
				title="Heading 1"
			>
				H1
			</button>
			<button
				class="toolbar-btn"
				class:active={editor.isActive('heading', { level: 2 })}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
				title="Heading 2"
			>
				H2
			</button>
			<button
				class="toolbar-btn"
				class:active={editor.isActive('heading', { level: 3 })}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
				title="Heading 3"
			>
				H3
			</button>

			<div class="divider"></div>

			<!-- Bullet List -->
			<button
				class="toolbar-btn"
				class:active={editor.isActive('bulletList')}
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
				title="Bullet List"
			>
				• List
			</button>

			<!-- Save Button -->
			<div class="toolbar-spacer"></div>
			<button class="btn btn-primary btn-sm" class:is-dirty={isDirty} onclick={handleSave}>
				{isDirty ? 'Simpan*' : 'Disimpan'}
			</button>
		</div>
	{/if}

	<!-- Editor Area -->
	<div class="editor-content" bind:this={element}></div>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		min-height: 400px;
		padding: 0;
		overflow: hidden;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 12px 16px;
		background: rgba(30, 30, 66, 0.4);
		border-bottom: 1px solid var(--border-subtle);
	}

	.toolbar-spacer {
		flex: 1;
	}

	.toolbar-btn {
		background: none;
		border: 1px solid transparent;
		color: var(--text-secondary);
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.toolbar-btn:hover {
		background: rgba(108, 99, 255, 0.1);
		color: var(--text-primary);
	}

	.toolbar-btn.active {
		background: var(--gradient-primary);
		color: white;
		border-color: transparent;
	}

	.divider {
		width: 1px;
		height: 20px;
		background: var(--border-subtle);
		margin: 0 4px;
	}

	.btn-sm {
		padding: 6px 14px;
		font-size: 13px;
	}

	.is-dirty {
		box-shadow: 0 0 10px rgba(255, 217, 61, 0.3);
	}

	.editor-content {
		padding: 24px;
		flex: 1;
		overflow-y: auto;
	}

	/* TipTap Global Styling for Prose */
	:global(.ProseMirror) {
		color: var(--text-primary);
	}

	:global(.ProseMirror h1) {
		font-size: 2em;
		font-weight: 800;
		margin-bottom: 0.5em;
		color: white;
	}

	:global(.ProseMirror h2) {
		font-size: 1.5em;
		font-weight: 700;
		margin-top: 1em;
		margin-bottom: 0.5em;
		color: white;
	}

	:global(.ProseMirror h3) {
		font-size: 1.25em;
		font-weight: 600;
		margin-top: 1em;
		margin-bottom: 0.5em;
		color: var(--text-primary);
	}

	:global(.ProseMirror p) {
		margin-bottom: 1em;
		line-height: 1.6;
	}

	:global(.ProseMirror ul) {
		list-style-type: disc;
		padding-left: 1.5em;
		margin-bottom: 1em;
	}

	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		color: var(--text-muted);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
</style>
