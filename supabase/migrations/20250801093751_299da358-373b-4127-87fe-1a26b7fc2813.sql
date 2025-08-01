-- Функция для пересчета рейтинга книги на основе отзывов в дневнике
CREATE OR REPLACE FUNCTION public.update_book_rating(book_id_param UUID)
RETURNS void AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    -- Вычисляем средний рейтинг из diary_entries для данной книги
    SELECT AVG(rating::NUMERIC) 
    INTO avg_rating
    FROM public.diary_entries 
    WHERE book_id = book_id_param 
    AND rating IS NOT NULL;
    
    -- Обновляем рейтинг книги
    UPDATE public.books 
    SET rating = ROUND(avg_rating, 1),
        updated_at = now()
    WHERE id = book_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция-триггер для автоматического обновления рейтинга
CREATE OR REPLACE FUNCTION public.handle_diary_entry_rating_change()
RETURNS TRIGGER AS $$
BEGIN
    -- При INSERT или UPDATE
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        -- Обновляем рейтинг для новой/измененной книги
        PERFORM public.update_book_rating(NEW.book_id);
        
        -- Если при UPDATE изменилась книга, обновляем и старую
        IF TG_OP = 'UPDATE' AND OLD.book_id != NEW.book_id THEN
            PERFORM public.update_book_rating(OLD.book_id);
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- При DELETE
    IF TG_OP = 'DELETE' THEN
        PERFORM public.update_book_rating(OLD.book_id);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер на изменения в diary_entries
DROP TRIGGER IF EXISTS diary_entry_rating_trigger ON public.diary_entries;
CREATE TRIGGER diary_entry_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_diary_entry_rating_change();

-- Пересчитываем рейтинги для всех существующих книг
DO $$
DECLARE
    book_record RECORD;
BEGIN
    FOR book_record IN SELECT id FROM public.books LOOP
        PERFORM public.update_book_rating(book_record.id);
    END LOOP;
END $$;