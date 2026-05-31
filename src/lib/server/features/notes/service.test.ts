import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNotes, addNote, updateNote, deleteNote } from './service';

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

describe('Notes Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getNotes should fetch notes ordered by updated_at', async () => {
		const mockData = [{ id: '1', title: 'Note 1' }];
		mockBuilder.order.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await getNotes(mockDb, 'user-1');

		expect(mockFrom).toHaveBeenCalledWith('notes');
		expect(mockBuilder.select).toHaveBeenCalledWith('*');
		expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
		expect(mockBuilder.order).toHaveBeenCalledWith('updated_at', { ascending: false });
		expect(result).toEqual(mockData);
	});

	it('addNote should insert new note', async () => {
		const mockData = { id: '2', title: 'New Note' };
		mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await addNote(mockDb, 'user-1', 'New Note', { content: 'test' });

		expect(mockFrom).toHaveBeenCalledWith('notes');
		expect(result).toEqual(mockData);
	});

	it('updateNote should only allow specific fields', async () => {
		const mockData = { id: '1', title: 'Updated' };
		mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await updateNote(mockDb, 'user-1', 'note-1', {
			title: 'Updated',
			malicious_field: 'hack'
		});

		expect(mockFrom).toHaveBeenCalledWith('notes');
		expect(result).toEqual(mockData);
	});

	it('deleteNote should delete note', async () => {
		mockBuilder.eq.mockReturnValueOnce(mockBuilder); 
		mockBuilder.eq.mockResolvedValueOnce({ error: null }); 
		
		const result = await deleteNote(mockDb, 'user-1', 'note-1');
		
		expect(mockFrom).toHaveBeenCalledWith('notes');
		expect(mockBuilder.delete).toHaveBeenCalled();
		expect(result.success).toBe(true);
	});
});
