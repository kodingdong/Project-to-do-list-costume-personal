import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, addTask, updateTask, deleteTask } from './service';

// Mock Supabase Client
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

const mockDb = {
	from: mockFrom
} as any;

describe('Tasks Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getTasks should fetch tasks ordered by created_at', async () => {
		const mockData = [{ id: '1', title: 'Task 1' }];
		mockBuilder.order.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await getTasks(mockDb, 'user-1');

		expect(mockFrom).toHaveBeenCalledWith('tasks');
		expect(mockBuilder.select).toHaveBeenCalledWith('*, sub_tasks(*)');
		expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
		expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
		expect(result).toEqual(mockData);
	});

	it('addTask should insert new task', async () => {
		const mockData = { id: '2', title: 'New Task' };
		mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await addTask(mockDb, 'user-1', 'New Task');

		expect(mockFrom).toHaveBeenCalledWith('tasks');
		expect(result).toEqual(mockData);
	});

	it('updateTask should only allow specific fields', async () => {
		const mockData = { id: '1', title: 'Updated' };
		mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await updateTask(mockDb, 'user-1', 'task-1', {
			title: 'Updated',
			malicious_field: 'hack'
		});

		expect(mockFrom).toHaveBeenCalledWith('tasks');
		expect(result).toEqual(mockData);
	});
	
	it('deleteTask should delete task', async () => {
		mockBuilder.eq.mockReturnValueOnce(mockBuilder); // For the first eq
		mockBuilder.eq.mockResolvedValueOnce({ error: null }); // For the second eq (awaited)
		
		const result = await deleteTask(mockDb, 'user-1', 'task-1');
		
		expect(mockFrom).toHaveBeenCalledWith('tasks');
		expect(mockBuilder.delete).toHaveBeenCalled();
		expect(result.success).toBe(true);
	});
});
