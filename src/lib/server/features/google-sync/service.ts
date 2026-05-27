/**
 * Google Sync Service — Business logic untuk Google Tasks & Calendar
 */

/**
 * Buat task di Google Tasks
 */
export async function createGoogleTask(providerToken: string, title: string, notes?: string) {
	// Panggil Google Tasks API
	const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${providerToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			title,
			notes
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Google Tasks API error: ${response.status} ${errorText}`);
	}

	return await response.json();
}

/**
 * Buat event di Google Calendar
 */
export async function createCalendarEvent(providerToken: string, title: string, datetime: string) {
	const startTime = new Date(datetime);
	// Default durasi event 1 jam
	const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

	const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${providerToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			summary: title,
			start: {
				dateTime: startTime.toISOString()
			},
			end: {
				dateTime: endTime.toISOString()
			}
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Google Calendar API error: ${response.status} ${errorText}`);
	}

	return await response.json();
}
