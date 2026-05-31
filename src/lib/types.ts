export interface SubTask {
	id: string;
	task_id: string;
	title: string;
	is_completed: boolean;
}

export interface Task {
	id: string;
	user_id: string;
	title: string;
	context: string;
	energy_level: string;
	is_completed: boolean;
	reminder_at: string | null;
	created_at: string;
	sub_tasks?: SubTask[];
}

export interface Habit {
	id: string;
	user_id: string;
	title: string;
	streak_count: number;
	last_completed: string | null;
	is_done_today: boolean;
	created_at: string;
}

export interface Note {
	id: string;
	title: string;
	body: unknown;
	updated_at: string;
}

export interface Quote {
	id: string;
	content: string;
	category: string | null;
}

export interface InboxItem {
	id: string;
	content: string;
	type: 'text' | 'audio';
	created_at: string;
}
