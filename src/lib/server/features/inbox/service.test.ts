import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInboxItems, addInboxItem, deleteInboxItem } from './service';

const mockBuilder = {
	select: vi.fn().mockReturnThis(),
	insert: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
	eq: vi.fn().mockReturnThis(),
	order: vi.fn().mockReturnThis(),
	single: vi.fn().mockReturnThis()
};

const mockFrom = vi.fn().mockReturnValue(mockBuilder);
const mockDb = { from: mockFrom } as any;

describe('Inbox Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getInboxItems should fetch items ordered by created_at', async () => {
		const mockData = [{ id: '1', content: 'Item 1' }];
		mockBuilder.order.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await getInboxItems(mockDb, 'user-1');

		expect(mockFrom).toHaveBeenCalledWith('inbox');
		expect(mockBuilder.select).toHaveBeenCalledWith('*');
		expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1');
		expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
		expect(result).toEqual(mockData);
	});

	it('addInboxItem should insert new item', async () => {
		const mockData = { id: '2', content: 'New Item' };
		mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

		const result = await addInboxItem(mockDb, 'user-1', 'New Item', 'text');

		expect(mockFrom).toHaveBeenCalledWith('inbox');
		expect(result).toEqual(mockData);
	});

	it('deleteInboxItem should delete item', async () => {
		mockBuilder.eq.mockReturnValueOnce(mockBuilder); 
		mockBuilder.eq.mockResolvedValueOnce({ error: null }); 
		
		const result = await deleteInboxItem(mockDb, 'user-1', 'item-1');
		
		expect(mockFrom).toHaveBeenCalledWith('inbox');
		expect(mockBuilder.delete).toHaveBeenCalled();
		expect(result.success).toBe(true);
	});
});
