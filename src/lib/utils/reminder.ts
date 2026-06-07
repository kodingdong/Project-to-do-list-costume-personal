/**
 * Reminder Utility — Sistem pengingat tugas via Browser Notification API
 *
 * Fitur:
 * - Polling setiap 60 detik untuk cek tasks dengan reminder
 * - Notifikasi browser saat waktu reminder tiba (selisih < 5 menit)
 * - Mencegah duplikat notifikasi untuk task yang sama
 * - Handle permission request dan tab visibility
 */



// Set untuk melacak task yang sudah dinotifikasi dan timestampnya (mencegah duplikat & leak)
const notifiedTaskIds = new Map<string, number>();

// Interval ID untuk cleanup
let intervalId: ReturnType<typeof setInterval> | null = null;

// Tipe untuk data task
interface TaskWithReminder {
	id: string;
	title: string;
	context?: string;
	is_completed: boolean;
	reminder_at: string | null;
}

/**
 * Minta izin notifikasi dari browser
 */
async function requestNotificationPermission(): Promise<boolean> {
	if (!('Notification' in window)) return false;

	if (Notification.permission === 'granted') return true;
	if (Notification.permission === 'denied') return false;

	const permission = await Notification.requestPermission();
	return permission === 'granted';
}

/**
 * Tampilkan notifikasi browser
 */
function showNotification(title: string, body: string) {
	if (Notification.permission !== 'granted') return;

	const notification = new Notification(title, {
		body,
		icon: '⏰',
		badge: '⚡',
		tag: `flowdo-reminder-${title}`, // Grup notifikasi
		requireInteraction: true // Notifikasi tidak auto-dismiss
	});

	// Auto-close setelah 30 detik
	setTimeout(() => notification.close(), 30000);
}

/**
 * Cek tasks yang punya reminder dan waktunya sudah dekat
 */
async function checkReminders() {
	try {
		const res = await fetch('/api/tasks/reminders');
		const data = res.ok ? await res.json() : null;
		const error = !res.ok;

		if (error || !data) return;

		const now = Date.now();
		const FIVE_MINUTES = 5 * 60 * 1000;

		// Cleanup mem leak: Hapus task yang sudah dinotifikasi > 1 jam lalu
		for (const [taskId, time] of notifiedTaskIds.entries()) {
			if (now - time > 60 * 60 * 1000) {
				notifiedTaskIds.delete(taskId);
			}
		}

		for (const task of data as TaskWithReminder[]) {
			// Skip jika tidak ada reminder, sudah selesai, atau sudah dinotifikasi
			if (!task.reminder_at || task.is_completed || notifiedTaskIds.has(task.id)) continue;

			const reminderTime = new Date(task.reminder_at).getTime();
			const diff = reminderTime - now;

			// Notifikasi jika waktu reminder dalam 5 menit ke depan atau sudah lewat (max 5 menit lalu)
			if (diff <= FIVE_MINUTES && diff >= -FIVE_MINUTES) {
				showNotification('⏰ Pengingat Task', `${task.title}\n${task.context || ''}`);
				notifiedTaskIds.set(task.id, now);
			}
		}
	} catch {
		// Silently fail — jaringan bisa offline
	}
}

/**
 * Mulai sistem reminder polling
 * @param accessToken - Supabase access token untuk auth API
 */
export function startReminders() {
	// Hentikan polling sebelumnya jika ada
	stopReminders();

	// Minta izin notifikasi
	requestNotificationPermission();

	// Cek langsung saat pertama kali
	checkReminders();

	// Polling setiap 60 detik
	intervalId = setInterval(() => {
		checkReminders();
	}, 60000);
}

/**
 * Hentikan sistem reminder polling
 */
export function stopReminders() {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

/**
 * Clear cache notifikasi (digunakan saat task di-update)
 */
export function clearNotifiedTask(taskId: string) {
	notifiedTaskIds.delete(taskId);
}
