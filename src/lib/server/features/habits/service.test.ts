import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHabits, addHabit, toggleHabitDone, deleteHabit } from './service';

const mockBuilder = {
	select: vi.fn().mockReturnThis(),
	insert: vi.fn().mockReturnThis(),
	update: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
	eq: vi.fn().mockReturnThis(),
	order: vi.fn().mockReturnThis(),
	single: vi.fn().mockReturnThis()
};

const mockFrom = vi.fn().mockReturnValue(mockBuilder);
const mockDb = { from: mockFrom } as any;

describe('Habits Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getHabits should fetch habits ordered by created_at', async () => {
		const mockData = [{ id: '1', title: 'Habit 1' }];
		mockBuilder.order.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await getHabits(mockDb, 'user-1');

		expect(mockFrom).toHaveBeenCalledWith('habits');
		expect(mockBuilder.select).toHaveBeenCalledWith('*');
		expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
		expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: true });
		expect(result).toEqual(mockData);
	});

	it('addHabit should insert new habit', async () => {
		const mockData = { id: '2', title: 'New Habit' };
		mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await addHabit(mockDb, 'user-1', 'New Habit');

		expect(mockFrom).toHaveBeenCalledWith('habits');
		expect(result).toEqual(mockData);
	});

	it('toggleHabitDone should update is_done_today', async () => {
		const mockData = { id: '1', is_done_today: true };
		mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await toggleHabitDone(mockDb, 'user-1', 'habit-1', true);

		expect(mockFrom).toHaveBeenCalledWith('habits');
		expect(result).toEqual(mockData);
	});

	it('deleteHabit should delete habit', async () => {
		mockBuilder.eq.mockReturnValueOnce(mockBuilder); // For the first eq
		mockBuilder.eq.mockResolvedValueOnce({ error: null }); // For the second eq (awaited)
		
		const result = await deleteHabit(mockDb, 'user-1', 'habit-1');
		
		expect(mockFrom).toHaveBeenCalledWith('habits');
		expect(mockBuilder.delete).toHaveBeenCalled();
		expect(result.success).toBe(true);
	});
});
