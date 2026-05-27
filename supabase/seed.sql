-- Seed Data — Data sampel untuk development
-- Catatan: user_id harus diganti dengan UUID user yang valid setelah login

-- Contoh inbox items (akan diinsert manual setelah ada user)
-- INSERT INTO public.inbox (user_id, content, type) VALUES
--   ('YOUR-USER-UUID', 'Beli kopi dan snack untuk coding marathon', 'text'),
--   ('YOUR-USER-UUID', 'Ide: Bikin fitur dark mode toggle', 'text'),
--   ('YOUR-USER-UUID', 'Review PR dari kemarin sebelum standup', 'text'),
--   ('YOUR-USER-UUID', 'Catatan voice: desain ulang halaman login', 'audio'),
--   ('YOUR-USER-UUID', 'Baca artikel tentang Svelte 5 Runes', 'text');

-- Kutipan motivasi (untuk tabel quotes nanti — Tahap 3)
-- INSERT INTO public.quotes (user_id, content, category) VALUES
--   ('YOUR-USER-UUID', 'The best way to predict the future is to create it.', 'motivasi'),
--   ('YOUR-USER-UUID', 'Code is like humor. When you have to explain it, it is bad.', 'coding'),
--   ('YOUR-USER-UUID', 'Invest in yourself. Your career is the engine of your wealth.', 'finansial'),
--   ('YOUR-USER-UUID', 'First, solve the problem. Then, write the code.', 'coding'),
--   ('YOUR-USER-UUID', 'The only way to do great work is to love what you do.', 'motivasi');
