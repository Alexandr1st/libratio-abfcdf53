-- Clear all genres from books table
UPDATE public.books 
SET genre = '', 
    updated_at = now()
WHERE genre IS NOT NULL OR genre != '';