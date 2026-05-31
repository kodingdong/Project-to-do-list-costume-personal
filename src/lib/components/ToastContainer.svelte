<script lang="ts">
	import { toasts, removeToast } from '$lib/stores/toast';
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<div
			class="toast glass-card animate-slide-up"
			class:toast-error={toast.type === 'error'}
			class:toast-success={toast.type === 'success'}
		>
			<span class="toast-icon">
				{#if toast.type === 'error'}⚠️
				{:else if toast.type === 'success'}✅
				{:else}ℹ️{/if}
			</span>
			<span class="toast-message">{toast.message}</span>
			<button class="toast-close" onclick={() => removeToast(toast.id)}>✕</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 24px;
		right: 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		z-index: 9999;
		pointer-events: none;
	}

	.toast {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: var(--radius-md);
		min-width: 300px;
		max-width: 400px;
		box-shadow: var(--shadow-lg);
	}

	.toast-error {
		border-left: 4px solid var(--accent-danger);
	}

	.toast-success {
		border-left: 4px solid var(--accent-secondary);
	}

	.toast-icon {
		font-size: 18px;
	}

	.toast-message {
		flex: 1;
		font-size: 14px;
		color: var(--text-primary);
	}

	.toast-close {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 14px;
		padding: 4px;
	}

	.toast-close:hover {
		color: var(--text-primary);
	}

	@media (max-width: 600px) {
		.toast-container {
			bottom: 16px;
			left: 16px;
			right: 16px;
		}
		.toast {
			min-width: unset;
			width: 100%;
		}
	}
</style>
