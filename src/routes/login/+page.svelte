<!--
  Login Page — Halaman login dengan Google OAuth

  Desain premium dark mode dengan glassmorphism effect.
  Menggunakan Supabase signInWithOAuth.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';

	let isLoading = $state(false);
	let errorMessage = $state('');

	// Redirect jika sudah login
	let userData = $derived($page.data?.user);
	$effect(() => {
		if (userData) goto(resolveRoute('/', {}));
	});

	async function loginWithGoogle() {
		isLoading = true;
		errorMessage = '';

		try {
			const supabase = $page.data?.supabase;
			if (!supabase) {
				errorMessage = 'Supabase belum terkonfigurasi.';
				isLoading = false;
				return;
			}

			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/`,
					scopes: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar'
				}
			});

			if (error) {
				errorMessage = `Login gagal: ${error.message}`;
				isLoading = false;
			}
		} catch {
			errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login — FlowDo</title>
</svelte:head>

<div class="login-page">
	<div class="login-container animate-slide-up">
		<!-- Decorative elements -->
		<div class="deco-orb orb-1"></div>
		<div class="deco-orb orb-2"></div>

		<!-- Logo -->
		<div class="login-logo">
			<span class="logo-emoji">⚡</span>
			<h1 class="logo-title">FlowDo</h1>
			<p class="logo-subtitle">Personal Productivity System</p>
		</div>

		<!-- Features -->
		<div class="feature-list">
			<div class="feature-item">
				<span>📥</span>
				<span>Emergency Inbox</span>
			</div>
			<div class="feature-item">
				<span>✅</span>
				<span>Smart To-Do List</span>
			</div>
			<div class="feature-item">
				<span>🔥</span>
				<span>Habit Tracker</span>
			</div>
			<div class="feature-item">
				<span>📝</span>
				<span>Rich Notes</span>
			</div>
		</div>

		<!-- Login Button -->
		<button class="login-btn" onclick={loginWithGoogle} disabled={isLoading} id="login-google-btn">
			{#if isLoading}
				<span class="spinner"></span>
				<span>Menghubungkan...</span>
			{:else}
				<svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				<span>Login dengan Google</span>
			{/if}
		</button>

		{#if errorMessage}
			<p class="error-msg animate-fade-in">{errorMessage}</p>
		{/if}

		<p class="login-note">
			Data kamu aman dan terenkripsi. <br />
			Hanya kamu yang bisa mengakses datamu.
		</p>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: 24px;
		position: relative;
		overflow: hidden;
	}

	.login-container {
		position: relative;
		width: 100%;
		max-width: 420px;
		background: rgba(30, 30, 66, 0.5);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-xl);
		padding: 40px 32px;
		text-align: center;
		z-index: 1;
	}

	/* Decorative orbs */
	.deco-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		z-index: -1;
	}

	.orb-1 {
		width: 250px;
		height: 250px;
		background: rgba(108, 99, 255, 0.2);
		top: -80px;
		right: -60px;
	}

	.orb-2 {
		width: 200px;
		height: 200px;
		background: rgba(0, 212, 170, 0.15);
		bottom: -60px;
		left: -40px;
	}

	.login-logo {
		margin-bottom: 32px;
	}

	.logo-emoji {
		font-size: 48px;
		display: block;
		margin-bottom: 12px;
	}

	.logo-title {
		font-size: 32px;
		font-weight: 800;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 6px;
	}

	.logo-subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		font-weight: 400;
	}

	.feature-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-bottom: 32px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: rgba(108, 99, 255, 0.06);
		border: 1px solid rgba(108, 99, 255, 0.08);
		border-radius: var(--radius-md);
		font-size: 13px;
		color: var(--text-secondary);
	}

	.login-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 14px 24px;
		background: white;
		color: #333;
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-sans);
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.login-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
	}

	.login-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.google-icon {
		flex-shrink: 0;
	}

	.error-msg {
		margin-top: 16px;
		font-size: 13px;
		color: var(--accent-danger);
	}

	.login-note {
		margin-top: 24px;
		font-size: 12px;
		color: var(--text-muted);
		line-height: 1.6;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-top-color: #333;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
