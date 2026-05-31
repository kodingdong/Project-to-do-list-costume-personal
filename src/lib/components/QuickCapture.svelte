<!--
  QuickCapture.svelte — Komponen input cepat untuk Emergency Inbox

  Fitur:
  - Input teks dengan tombol Submit
  - Tombol mikrofon (Web Speech API untuk voice-to-text)
  - Panggil API via Eden Treaty

  Menggunakan Svelte 5 Runes ($state, $derived)
-->
<script lang="ts">
	import { api } from '$lib/eden';

	// Props dari parent
	let { onItemAdded = () => {} }: { onItemAdded?: () => void } = $props();

	// State
	let content = $state('');
	let isSubmitting = $state(false);
	let isListening = $state(false);
	let errorMessage = $state('');

	// Derived
	let canSubmit = $derived(content.trim().length > 0 && !isSubmitting);

	import { getAuthHeaders } from '$lib/utils/auth';

	/**
	 * Submit inbox item via API
	 */
	async function handleSubmit() {
		if (!canSubmit) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			const { error } = await api.api.inbox.post(
				{
					content: content.trim(),
					type: 'text'
				},
				{ headers: getAuthHeaders() }
			);

			if (error) {
				errorMessage = 'Gagal menyimpan. Pastikan kamu sudah login.';
				return;
			}

			content = '';
			onItemAdded();
		} catch {
			errorMessage = 'Terjadi kesalahan jaringan.';
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Voice-to-text via Web Speech API
	 */
	function startVoiceInput() {
		if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
			errorMessage = 'Browser tidak mendukung Speech Recognition.';
			return;
		}

		const SpeechRecognition =
			(window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
			(window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;
		const recognition = new SpeechRecognition();

		recognition.lang = 'id-ID'; // Bahasa Indonesia
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			isListening = true;
			errorMessage = '';
		};

		recognition.onresult = (event: Event & { results: { transcript: string }[][] }) => {
			const transcript = event.results[0][0].transcript;
			content += (content ? ' ' : '') + transcript;
		};

		recognition.onerror = () => {
			errorMessage = 'Gagal mendengarkan. Coba lagi.';
			isListening = false;
		};

		recognition.onend = () => {
			isListening = false;
		};

		recognition.start();
	}

	/**
	 * Handle Enter key
	 */
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="quick-capture glass-card animate-fade-in">
	<div class="capture-header">
		<span class="capture-icon">⚡</span>
		<h2 class="capture-title">Quick Capture</h2>
	</div>

	<div class="capture-input-row">
		<input
			type="text"
			class="input capture-input"
			placeholder="Tangkap ide, tugas, atau catatan cepat..."
			bind:value={content}
			onkeydown={handleKeydown}
			disabled={isSubmitting}
			id="quick-capture-input"
		/>

		<button
			class="btn btn-icon mic-btn"
			class:listening={isListening}
			onclick={startVoiceInput}
			disabled={isListening}
			title="Voice input"
			id="voice-input-btn"
		>
			{isListening ? '🔴' : '🎙️'}
		</button>

		<button
			class="btn btn-primary submit-btn"
			onclick={handleSubmit}
			disabled={!canSubmit}
			id="submit-inbox-btn"
		>
			{#if isSubmitting}
				<span class="spinner"></span>
			{:else}
				Simpan
			{/if}
		</button>
	</div>

	{#if isListening}
		<div class="listening-indicator animate-fade-in">
			<span class="listening-dot"></span>
			Mendengarkan...
		</div>
	{/if}

	{#if errorMessage}
		<p class="error-text animate-fade-in">{errorMessage}</p>
	{/if}
</div>

<style>
	.quick-capture {
		padding: 20px;
	}

	.capture-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
	}

	.capture-icon {
		font-size: 20px;
	}

	.capture-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.capture-input-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.capture-input {
		flex: 1;
	}

	.mic-btn {
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		font-size: 18px;
		flex-shrink: 0;
	}

	.mic-btn:hover {
		border-color: var(--border-active);
	}

	.mic-btn.listening {
		animation: pulse-glow 1.5s infinite;
		border-color: var(--accent-danger);
	}

	.submit-btn {
		flex-shrink: 0;
		min-width: 90px;
	}

	.listening-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 10px;
		font-size: 13px;
		color: var(--accent-danger);
	}

	.listening-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent-danger);
		animation: pulse-glow 1s infinite;
	}

	.error-text {
		margin-top: 10px;
		font-size: 13px;
		color: var(--accent-danger);
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
