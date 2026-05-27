<!--
  Habits Page — Habit Tracker dengan streak system

  Fitur:
  - Daftar habits harian dengan tombol centang
  - Streak counter dengan emoji api 🔥
  - Pesan apresiasi saat streak >= 7
  - Form tambah habit baru
  - Progress ring harian

  Menggunakan Svelte 5 Runes ($state, $derived, $effect)
-->
<script lang="ts">
	import { api } from '$lib/eden';
	import { page } from '$app/stores';
	import { resolveRoute } from '$app/paths';

	// ===== Types =====
	interface Habit {
		id: string;
		user_id: string;
		title: string;
		streak_count: number;
		last_completed: string | null;
		is_done_today: boolean;
		created_at: string;
	}

	// ===== State =====
	let habits = $state<Habit[]>([]);
	let isLoading = $state(true);
	let showForm = $state(false);
	let newTitle = $state('');
	let isSubmitting = $state(false);

	// Auth
	let accessToken = $derived($page.data?.session?.access_token || '');

	// ===== Derived =====
	let doneCount = $derived(habits.filter((h) => h.is_done_today).length);
	let totalCount = $derived(habits.length);
	let dailyProgress = $derived(totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0);
	let bestStreak = $derived(habits.length > 0 ? Math.max(...habits.map((h) => h.streak_count)) : 0);

	// Pesan apresiasi berdasarkan streak
	const streakMessages: Record<number, string> = {
		7: '🎉 Satu minggu berturut! Konsistensi luar biasa!',
		14: '🏆 Dua minggu! Kamu sedang membangun kebiasaan!',
		21: '💎 Tiga minggu! Habit ini jadi bagian dari dirimu!',
		30: '👑 Satu bulan! Kamu LEGENDA konsistensi!',
		50: '🌟 50 hari streak! INCREDIBLE!',
		100: '🔥 100 HARI! Kamu tidak terbendung!'
	};

	function getStreakMessage(streak: number): string | null {
		// Tampilkan pesan apresiasi untuk milestone terdekat yang sudah dicapai
		const milestones = Object.keys(streakMessages)
			.map(Number)
			.sort((a, b) => b - a);
		for (const m of milestones) {
			if (streak >= m) return streakMessages[m];
		}
		return null;
	}

	function getStreakEmoji(streak: number): string {
		if (streak >= 30) return '👑';
		if (streak >= 14) return '💎';
		if (streak >= 7) return '🏆';
		if (streak >= 3) return '🔥';
		if (streak >= 1) return '✨';
		return '💤';
	}

	// ===== Functions =====
	function headers() {
		return { Authorization: `Bearer ${accessToken}` };
	}

	async function fetchHabits() {
		try {
			isLoading = true;
			const { data, error } = await api.api.habits.get({ headers: headers() });
			if (!error) habits = (data as Habit[]) || [];
		} catch {
			/* silently fail */
		} finally {
			isLoading = false;
		}
	}

	async function addHabit() {
		if (!newTitle.trim() || isSubmitting) return;
		isSubmitting = true;
		try {
			const { error } = await api.api.habits.post(
				{ title: newTitle.trim() },
				{ headers: headers() }
			);
			if (!error) {
				newTitle = '';
				showForm = false;
				await fetchHabits();
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function toggleHabit(habit: Habit) {
		const newStatus = !habit.is_done_today;
		// Optimistic update
		habit.is_done_today = newStatus;
		if (newStatus) {
			habit.streak_count += 1;
		}

		const { data, error } = await api.api
			.habits({ id: habit.id })
			.put({ is_done_today: newStatus }, { headers: headers() });

		// Sync dengan response server (trigger mungkin mengubah streak)
		if (!error && data) {
			const serverHabit = data as Habit;
			habit.streak_count = serverHabit.streak_count;
			habit.last_completed = serverHabit.last_completed;
			habit.is_done_today = serverHabit.is_done_today;
		}
	}

	async function deleteHabit(habitId: string) {
		habits = habits.filter((h) => h.id !== habitId);
		await api.api.habits({ id: habitId }).delete({ headers: headers() });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addHabit();
		}
	}

	$effect(() => {
		if ($page.data?.user) fetchHabits();
		else isLoading = false;
	});
</script>

<svelte:head>
	<title>Habits — FlowDo</title>
</svelte:head>

<div class="habits-page">
	<!-- Page Header -->
	<div class="page-header animate-fade-in">
		<div class="header-top">
			<div>
				<h1 class="page-title">🔥 Habits</h1>
				<p class="page-sub">Bangun kebiasaan, satu hari pada satu waktu.</p>
			</div>
			<button
				class="btn btn-primary add-btn"
				onclick={() => (showForm = !showForm)}
				id="add-habit-btn"
			>
				{showForm ? '✕' : '＋'}
				{showForm ? 'Batal' : 'Tambah'}
			</button>
		</div>
	</div>

	<!-- Daily Progress Ring -->
	{#if habits.length > 0}
		<div class="daily-progress glass-card animate-fade-in">
			<div class="progress-ring-container">
				<svg class="progress-ring" viewBox="0 0 120 120">
					<circle class="ring-bg" cx="60" cy="60" r="50" />
					<circle
						class="ring-fill"
						cx="60"
						cy="60"
						r="50"
						stroke-dasharray={2 * Math.PI * 50}
						stroke-dashoffset={2 * Math.PI * 50 * (1 - dailyProgress / 100)}
					/>
				</svg>
				<div class="ring-text">
					<span class="ring-pct">{dailyProgress}%</span>
					<span class="ring-label">Hari ini</span>
				</div>
			</div>
			<div class="daily-stats">
				<div class="dstat">
					<span class="dstat-num">{doneCount}/{totalCount}</span>
					<span class="dstat-label">Selesai hari ini</span>
				</div>
				<div class="dstat">
					<span class="dstat-num">{bestStreak}</span>
					<span class="dstat-label">Best streak 🔥</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Best streak appreciation message -->
	{#if bestStreak >= 7}
		{@const msg = getStreakMessage(bestStreak)}
		{#if msg}
			<div class="appreciation glass-card animate-fade-in">
				<p class="appreciation-text">{msg}</p>
			</div>
		{/if}
	{/if}

	<!-- Add Habit Form -->
	{#if showForm}
		<div class="add-form glass-card animate-fade-in">
			<div class="form-row">
				<input
					type="text"
					class="input"
					placeholder="Nama habit baru... (contoh: Olahraga 30 menit)"
					bind:value={newTitle}
					onkeydown={handleKeydown}
					id="habit-title-input"
				/>
				<button
					class="btn btn-primary"
					onclick={addHabit}
					disabled={!newTitle.trim() || isSubmitting}
					id="submit-habit-btn"
				>
					{#if isSubmitting}
						<span class="spinner"></span>
					{:else}
						Simpan
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<!-- Habits List -->
	<div class="habits-list">
		{#if isLoading}
			<div class="skeletons">
				<div class="skel"></div>
				<div class="skel"></div>
				<div class="skel"></div>
			</div>
		{:else if !$page.data?.user}
			<div class="empty glass-card">
				<span class="empty-ico">🔒</span>
				<p class="empty-t">Login untuk mulai</p>
				<a href={resolveRoute('/login', {})} class="btn btn-primary">Login</a>
			</div>
		{:else if habits.length === 0}
			<div class="empty glass-card">
				<span class="empty-ico">🌱</span>
				<p class="empty-t">Belum ada habit</p>
				<p class="empty-d">Mulai bangun kebiasaan baik hari ini!</p>
			</div>
		{:else}
			{#each habits as habit, i (habit.id)}
				<div
					class="habit-card glass-card animate-fade-in"
					class:done={habit.is_done_today}
					style="animation-delay:{i * 50}ms"
				>
					<button
						class="habit-check"
						class:checked={habit.is_done_today}
						onclick={() => toggleHabit(habit)}
						title={habit.is_done_today ? 'Batalkan' : 'Selesai!'}
					>
						<span class="check-circle">
							{#if habit.is_done_today}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							{/if}
						</span>
					</button>

					<div class="habit-info">
						<p class="habit-title" class:line-through={habit.is_done_today}>{habit.title}</p>
						<div class="streak-row">
							<span class="streak-emoji">{getStreakEmoji(habit.streak_count)}</span>
							<span class="streak-count">
								{habit.streak_count} hari
							</span>
							{#if habit.streak_count >= 7}
								<span class="streak-fire">
									{'🔥'.repeat(Math.min(Math.floor(habit.streak_count / 7), 5))}
								</span>
							{/if}
						</div>
					</div>

					<button
						class="btn btn-icon btn-danger del-btn"
						onclick={() => deleteHabit(habit.id)}
						title="Hapus habit">🗑️</button
					>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- SVG Gradient Definition (hidden) -->
<svg style="position: absolute; width: 0; height: 0;">
	<defs>
		<linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" stop-color="#00d4aa" />
			<stop offset="100%" stop-color="#4ecdc4" />
		</linearGradient>
	</defs>
</svg>

<style>
	.habits-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.page-title {
		font-size: 24px;
		font-weight: 800;
		margin-bottom: 4px;
	}

	.page-sub {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.add-btn {
		flex-shrink: 0;
		font-size: 13px;
	}

	/* Daily Progress Ring */
	.daily-progress {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 24px;
	}

	.progress-ring-container {
		position: relative;
		width: 120px;
		height: 120px;
		flex-shrink: 0;
	}

	.progress-ring {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-bg {
		fill: none;
		stroke: var(--bg-input);
		stroke-width: 8;
	}

	.ring-fill {
		fill: none;
		stroke: url(#ring-gradient);
		stroke-width: 8;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.6s ease-out;
	}

	.ring-text {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.ring-pct {
		font-size: 24px;
		font-weight: 800;
		background: var(--gradient-secondary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.ring-label {
		font-size: 11px;
		color: var(--text-muted);
	}

	.daily-stats {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
	}

	.dstat {
		display: flex;
		flex-direction: column;
	}

	.dstat-num {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.dstat-label {
		font-size: 12px;
		color: var(--text-muted);
	}

	/* Appreciation */
	.appreciation {
		padding: 16px 20px;
		background: linear-gradient(135deg, rgba(255, 217, 61, 0.08) 0%, rgba(0, 212, 170, 0.08) 100%);
		border-color: rgba(255, 217, 61, 0.2);
		text-align: center;
	}

	.appreciation-text {
		font-size: 14px;
		font-weight: 600;
		color: var(--accent-warning);
	}

	/* Add Form */
	.add-form {
		padding: 16px;
	}

	.form-row {
		display: flex;
		gap: 8px;
	}

	.form-row .input {
		flex: 1;
	}

	/* Habit Card */
	.habit-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px 18px;
		transition: all var(--transition-normal);
	}

	.habit-card.done {
		background: rgba(0, 212, 170, 0.06);
		border-color: rgba(0, 212, 170, 0.2);
	}

	/* Check Button */
	.habit-check {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
	}

	.check-circle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid var(--text-muted);
		transition: all var(--transition-fast);
		color: transparent;
	}

	.check-circle svg {
		width: 16px;
		height: 16px;
	}

	.habit-check.checked .check-circle {
		background: var(--gradient-secondary);
		border-color: var(--accent-secondary);
		color: white;
	}

	.habit-check:hover .check-circle {
		border-color: var(--accent-secondary);
		transform: scale(1.1);
	}

	/* Habit Info */
	.habit-info {
		flex: 1;
		min-width: 0;
	}

	.habit-title {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.line-through {
		text-decoration: line-through;
		color: var(--text-muted);
	}

	.streak-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.streak-emoji {
		font-size: 14px;
	}

	.streak-count {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.streak-fire {
		font-size: 12px;
	}

	/* Delete */
	.del-btn {
		flex-shrink: 0;
		font-size: 14px;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.habit-card:hover .del-btn {
		opacity: 1;
	}

	/* Shared */
	.habits-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.skeletons {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.skel {
		height: 72px;
		background: linear-gradient(
			90deg,
			var(--bg-card) 25%,
			var(--bg-card-hover) 50%,
			var(--bg-card) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: var(--radius-lg);
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 40px 24px;
		text-align: center;
	}

	.empty-ico {
		font-size: 40px;
	}

	.empty-t {
		font-size: 16px;
		font-weight: 700;
	}

	.empty-d {
		font-size: 13px;
		color: var(--text-secondary);
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
