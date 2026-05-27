<!--
  Tasks Page — Smart To-Do List dengan context & energy level

  Fitur:
  - Form tambah task (title, context, energy_level, reminder)
  - Daftar tasks dengan expandable sub-tasks
  - Progress bar reaktif per task
  - Filter berdasarkan context dan energy_level
  - Inline sub-task management

  Menggunakan Svelte 5 Runes ($state, $derived, $effect)
-->
<script lang="ts">
	import { api } from '$lib/eden';
	import { page } from '$app/stores';
	import { resolveRoute } from '$app/paths';

	// ===== Types =====
	interface SubTask {
		id: string;
		task_id: string;
		title: string;
		is_completed: boolean;
	}

	interface Task {
		id: string;
		user_id: string;
		title: string;
		context: string;
		energy_level: string;
		is_completed: boolean;
		reminder_at: string | null;
		created_at: string;
		sub_tasks: SubTask[];
	}

	// ===== State =====
	let tasks = $state<Task[]>([]);
	let isLoading = $state(true);
	let showForm = $state(false);
	let expandedTaskId = $state<string | null>(null);

	// Form state
	let newTitle = $state('');
	let newContext = $state('@Online');
	let newEnergy = $state('sedang');
	let newReminder = $state('');
	let isSubmitting = $state(false);

	// Sub-task form
	let newSubTaskTitle = $state('');
	let addingSubTaskId = $state<string | null>(null);

	// Filters
	let filterContext = $state('all');
	let filterEnergy = $state('all');
	let filterStatus = $state('all');

	// Auth
	let accessToken = $derived($page.data?.session?.access_token || '');

	// ===== Derived =====
	let filteredTasks = $derived(() => {
		return tasks.filter((t) => {
			if (filterContext !== 'all' && t.context !== filterContext) return false;
			if (filterEnergy !== 'all' && t.energy_level !== filterEnergy) return false;
			if (filterStatus === 'active' && t.is_completed) return false;
			if (filterStatus === 'done' && !t.is_completed) return false;
			return true;
		});
	});

	let totalActive = $derived(tasks.filter((t) => !t.is_completed).length);
	let totalDone = $derived(tasks.filter((t) => t.is_completed).length);

	// ===== Context & Energy Options =====
	const contexts = ['@Online', '@Rumah', '@DeepWork', '@Kantor', '@Errand'];
	const energyLevels = [
		{ value: 'tinggi', label: '🔥 Tinggi', color: 'var(--accent-danger)' },
		{ value: 'sedang', label: '⚡ Sedang', color: 'var(--accent-warning)' },
		{ value: 'rendah', label: '🌙 Rendah', color: 'var(--accent-info)' }
	];

	const contextEmoji: Record<string, string> = {
		'@Online': '🌐',
		'@Rumah': '🏠',
		'@DeepWork': '🎯',
		'@Kantor': '🏢',
		'@Errand': '🏃'
	};

	// ===== Functions =====
	function headers() {
		return { Authorization: `Bearer ${accessToken}` };
	}

	async function fetchTasks() {
		try {
			isLoading = true;
			const { data, error } = await api.api.tasks.get({ headers: headers() });
			if (!error) tasks = (data as Task[]) || [];
		} catch {
			/* silently fail */
		} finally {
			isLoading = false;
		}
	}

	async function addTask() {
		if (!newTitle.trim() || isSubmitting) return;
		isSubmitting = true;
		try {
			const { error } = await api.api.tasks.post(
				{
					title: newTitle.trim(),
					context: newContext,
					energy_level: newEnergy,
					reminder_at: newReminder || null
				},
				{ headers: headers() }
			);
			if (!error) {
				newTitle = '';
				newReminder = '';
				showForm = false;
				await fetchTasks();
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function toggleTask(task: Task) {
		const newStatus = !task.is_completed;
		task.is_completed = newStatus;
		await api.api.tasks({ id: task.id }).put({ is_completed: newStatus }, { headers: headers() });
	}

	async function deleteTask(taskId: string) {
		tasks = tasks.filter((t) => t.id !== taskId);
		await api.api.tasks({ id: taskId }).delete({ headers: headers() });
	}

	async function addSubTask(taskId: string) {
		if (!newSubTaskTitle.trim()) return;
		const { data, error } = await api.api
			.tasks({ id: taskId })
			.subtasks.post({ title: newSubTaskTitle.trim() }, { headers: headers() });
		if (!error && data) {
			const task = tasks.find((t) => t.id === taskId);
			if (task) task.sub_tasks = [...(task.sub_tasks || []), data as SubTask];
			newSubTaskTitle = '';
			addingSubTaskId = null;
		}
	}

	async function toggleSubTask(subTask: SubTask) {
		const newStatus = !subTask.is_completed;
		subTask.is_completed = newStatus;
		await api.api.tasks
			.subtasks({ id: subTask.id })
			.put({ is_completed: newStatus }, { headers: headers() });
	}

	async function deleteSubTask(taskId: string, subTaskId: string) {
		const task = tasks.find((t) => t.id === taskId);
		if (task) task.sub_tasks = task.sub_tasks.filter((s) => s.id !== subTaskId);
		await api.api.tasks.subtasks({ id: subTaskId }).delete({ headers: headers() });
	}

	function getProgress(task: Task): number {
		const subs = task.sub_tasks || [];
		if (subs.length === 0) return task.is_completed ? 100 : 0;
		const done = subs.filter((s) => s.is_completed).length;
		return Math.round((done / subs.length) * 100);
	}

	function toggleExpand(taskId: string) {
		expandedTaskId = expandedTaskId === taskId ? null : taskId;
	}

	function handleFormKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			addTask();
		}
	}

	function handleSubTaskKeydown(e: KeyboardEvent, taskId: string) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addSubTask(taskId);
		}
		if (e.key === 'Escape') {
			addingSubTaskId = null;
			newSubTaskTitle = '';
		}
	}

	$effect(() => {
		if ($page.data?.user) fetchTasks();
		else isLoading = false;
	});
</script>

<svelte:head>
	<title>Tasks — FlowDo</title>
</svelte:head>

<div class="tasks-page">
	<!-- Page Header -->
	<div class="page-header animate-fade-in">
		<div class="header-top">
			<div>
				<h1 class="page-title">✅ Tasks</h1>
				<p class="page-sub">Smart To-Do List dengan context & energy level.</p>
			</div>
			<button
				class="btn btn-primary add-btn"
				onclick={() => (showForm = !showForm)}
				id="add-task-btn"
			>
				{showForm ? '✕' : '＋'}
				{showForm ? 'Batal' : 'Tambah'}
			</button>
		</div>

		<!-- Stats -->
		{#if tasks.length > 0}
			<div class="stats-row">
				<div class="stat">
					<span class="stat-num">{totalActive}</span>
					<span class="stat-label">Aktif</span>
				</div>
				<div class="stat">
					<span class="stat-num">{totalDone}</span>
					<span class="stat-label">Selesai</span>
				</div>
				<div class="stat">
					<span class="stat-num">{tasks.length}</span>
					<span class="stat-label">Total</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Add Task Form -->
	{#if showForm}
		<div class="add-form glass-card animate-fade-in">
			<input
				type="text"
				class="input"
				placeholder="Apa yang harus dikerjakan?"
				bind:value={newTitle}
				onkeydown={handleFormKeydown}
				id="task-title-input"
			/>

			<div class="form-row">
				<div class="form-group">
					<label class="form-label" for="context-select">Context</label>
					<select class="input select" id="context-select" bind:value={newContext}>
						{#each contexts as ctx (ctx)}
							<option value={ctx}>{contextEmoji[ctx]} {ctx}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label class="form-label" for="energy-select">Energy</label>
					<select class="input select" id="energy-select" bind:value={newEnergy}>
						{#each energyLevels as lvl (lvl.value)}
							<option value={lvl.value}>{lvl.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-group">
				<label class="form-label" for="reminder-input">Pengingat (opsional)</label>
				<input type="datetime-local" class="input" id="reminder-input" bind:value={newReminder} />
			</div>

			<button
				class="btn btn-primary full-w"
				onclick={addTask}
				disabled={!newTitle.trim() || isSubmitting}
				id="submit-task-btn"
			>
				{#if isSubmitting}
					<span class="spinner"></span>
				{:else}
					Simpan Task
				{/if}
			</button>
		</div>
	{/if}

	<!-- Filters -->
	{#if tasks.length > 0}
		<div class="filters animate-fade-in">
			<select class="input select filter-select" bind:value={filterContext} id="filter-context">
				<option value="all">🏷️ Semua Context</option>
				{#each contexts as ctx (ctx)}
					<option value={ctx}>{contextEmoji[ctx]} {ctx}</option>
				{/each}
			</select>
			<select class="input select filter-select" bind:value={filterEnergy} id="filter-energy">
				<option value="all">⚡ Semua Energy</option>
				{#each energyLevels as lvl (lvl.value)}
					<option value={lvl.value}>{lvl.label}</option>
				{/each}
			</select>
			<select class="input select filter-select" bind:value={filterStatus} id="filter-status">
				<option value="all">📋 Semua</option>
				<option value="active">🔲 Aktif</option>
				<option value="done">✅ Selesai</option>
			</select>
		</div>
	{/if}

	<!-- Task List -->
	<div class="tasks-list">
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
		{:else if filteredTasks().length === 0}
			<div class="empty glass-card">
				<span class="empty-ico">{tasks.length === 0 ? '📝' : '🔍'}</span>
				<p class="empty-t">{tasks.length === 0 ? 'Belum ada task' : 'Tidak ada task yang cocok'}</p>
				<p class="empty-d">
					{tasks.length === 0 ? 'Tambahkan task pertamamu!' : 'Coba ubah filter.'}
				</p>
			</div>
		{:else}
			{#each filteredTasks() as task, i (task.id)}
				{@const progress = getProgress(task)}
				<div
					class="task-card glass-card animate-fade-in"
					class:completed={task.is_completed}
					style="animation-delay:{i * 40}ms"
				>
					<!-- Task Header -->
					<div class="task-header">
						<button
							class="check-btn"
							class:checked={task.is_completed}
							onclick={() => toggleTask(task)}
							title={task.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
						>
							{task.is_completed ? '✅' : '⬜'}
						</button>

						<div
							class="task-info"
							role="button"
							tabindex="0"
							onclick={() => toggleExpand(task.id)}
							onkeydown={(e) => e.key === 'Enter' && toggleExpand(task.id)}
						>
							<p class="task-title" class:line-through={task.is_completed}>{task.title}</p>
							<div class="task-meta">
								<span class="badge badge-primary"
									>{contextEmoji[task.context] || '🏷️'} {task.context}</span
								>
								<span
									class="badge"
									class:badge-danger={task.energy_level === 'tinggi'}
									class:badge-warning={task.energy_level === 'sedang'}
									class:badge-info={task.energy_level === 'rendah'}
								>
									{task.energy_level === 'tinggi'
										? '🔥'
										: task.energy_level === 'sedang'
											? '⚡'
											: '🌙'}
									{task.energy_level}
								</span>
								{#if task.reminder_at}
									<span class="badge badge-info">⏰</span>
								{/if}
							</div>
						</div>

						<button
							class="btn btn-icon btn-danger del-btn"
							onclick={() => deleteTask(task.id)}
							title="Hapus task">🗑️</button
						>
					</div>

					<!-- Progress Bar -->
					{#if (task.sub_tasks || []).length > 0}
						<div class="progress-section">
							<div class="progress-bar">
								<div class="progress-fill" style="width: {progress}%"></div>
							</div>
							<span class="progress-text">{progress}%</span>
						</div>
					{/if}

					<!-- Expanded: Sub-tasks -->
					{#if expandedTaskId === task.id}
						<div class="subtasks-section animate-fade-in">
							{#if (task.sub_tasks || []).length > 0}
								<div class="subtask-list">
									{#each task.sub_tasks as sub (sub.id)}
										<div class="subtask-item">
											<button
												class="sub-check"
												class:checked={sub.is_completed}
												onclick={() => toggleSubTask(sub)}
											>
												{sub.is_completed ? '☑️' : '☐'}
											</button>
											<span class="sub-title" class:line-through={sub.is_completed}
												>{sub.title}</span
											>
											<button
												class="sub-del"
												onclick={() => deleteSubTask(task.id, sub.id)}
												title="Hapus">✕</button
											>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Add Sub-task -->
							{#if addingSubTaskId === task.id}
								<div class="add-subtask-row">
									<input
										type="text"
										class="input sub-input"
										placeholder="Nama sub-task..."
										bind:value={newSubTaskTitle}
										onkeydown={(e) => handleSubTaskKeydown(e, task.id)}
										id="subtask-input-{task.id}"
									/>
									<button class="btn btn-primary btn-sm" onclick={() => addSubTask(task.id)}
										>＋</button
									>
								</div>
							{:else}
								<button
									class="add-subtask-btn"
									onclick={() => {
										addingSubTaskId = task.id;
										newSubTaskTitle = '';
									}}
								>
									＋ Tambah Sub-task
								</button>
							{/if}
						</div>
					{/if}

					<!-- Expand Toggle -->
					<button class="expand-toggle" onclick={() => toggleExpand(task.id)}>
						{expandedTaskId === task.id
							? '▲ Tutup'
							: `▼ Sub-tasks (${(task.sub_tasks || []).length})`}
					</button>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.tasks-page {
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

	/* Stats */
	.stats-row {
		display: flex;
		gap: 12px;
		margin-top: 12px;
	}

	.stat {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px;
		background: rgba(30, 30, 66, 0.4);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-subtle);
	}

	.stat-num {
		font-size: 20px;
		font-weight: 800;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stat-label {
		font-size: 11px;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Form */
	.add-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.select {
		appearance: none;
		cursor: pointer;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b6b8d' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 32px;
	}

	.full-w {
		width: 100%;
	}

	/* Filters */
	.filters {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 8px;
	}

	.filter-select {
		font-size: 12px;
		padding: 8px 10px;
	}

	/* Task Card */
	.task-card {
		padding: 0;
		overflow: hidden;
		transition: all var(--transition-normal);
	}

	.task-card.completed {
		opacity: 0.6;
	}

	.task-header {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
	}

	.check-btn {
		background: none;
		border: none;
		font-size: 20px;
		cursor: pointer;
		padding: 0;
		margin-top: 2px;
		flex-shrink: 0;
		transition: transform var(--transition-fast);
	}

	.check-btn:active {
		transform: scale(0.85);
	}

	.task-info {
		flex: 1;
		min-width: 0;
		cursor: pointer;
	}

	.task-title {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 8px;
		word-break: break-word;
	}

	.line-through {
		text-decoration: line-through;
		color: var(--text-muted);
	}

	.task-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.del-btn {
		flex-shrink: 0;
		font-size: 14px;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.task-card:hover .del-btn {
		opacity: 1;
	}

	/* Progress Bar */
	.progress-section {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 16px 12px;
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: var(--bg-input);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--gradient-secondary);
		border-radius: var(--radius-full);
		transition: width var(--transition-normal);
	}

	.progress-text {
		font-size: 12px;
		font-weight: 700;
		color: var(--accent-secondary);
		min-width: 36px;
		text-align: right;
	}

	/* Sub-tasks */
	.subtasks-section {
		padding: 0 16px 12px;
		border-top: 1px solid var(--border-subtle);
	}

	.subtask-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: 10px;
	}

	.subtask-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast);
	}

	.subtask-item:hover {
		background: rgba(108, 99, 255, 0.05);
	}

	.sub-check {
		background: none;
		border: none;
		font-size: 16px;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
	}

	.sub-title {
		flex: 1;
		font-size: 13px;
	}

	.sub-del {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 14px;
		opacity: 0;
		transition: opacity var(--transition-fast);
		padding: 2px 4px;
	}

	.subtask-item:hover .sub-del {
		opacity: 1;
	}

	.sub-del:hover {
		color: var(--accent-danger);
	}

	.add-subtask-row {
		display: flex;
		gap: 8px;
		margin-top: 10px;
	}

	.sub-input {
		flex: 1;
		font-size: 13px;
		padding: 8px 12px;
	}

	.btn-sm {
		padding: 6px 14px;
		font-size: 13px;
	}

	.add-subtask-btn {
		width: 100%;
		background: none;
		border: 1px dashed var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		font-size: 13px;
		font-family: var(--font-sans);
		padding: 10px;
		cursor: pointer;
		margin-top: 10px;
		transition: all var(--transition-fast);
	}

	.add-subtask-btn:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	/* Expand Toggle */
	.expand-toggle {
		width: 100%;
		background: rgba(108, 99, 255, 0.04);
		border: none;
		border-top: 1px solid var(--border-subtle);
		color: var(--text-muted);
		font-size: 12px;
		font-family: var(--font-sans);
		font-weight: 600;
		padding: 8px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.expand-toggle:hover {
		background: rgba(108, 99, 255, 0.08);
		color: var(--accent-primary);
	}

	/* Badge variants */
	.badge-warning {
		background: rgba(255, 217, 61, 0.15);
		color: var(--accent-warning);
	}

	.badge-info {
		background: rgba(78, 205, 196, 0.15);
		color: var(--accent-info);
	}

	/* Utilities */
	.tasks-list {
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
		height: 100px;
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

	@media (max-width: 420px) {
		.filters {
			grid-template-columns: 1fr;
		}
	}
</style>
