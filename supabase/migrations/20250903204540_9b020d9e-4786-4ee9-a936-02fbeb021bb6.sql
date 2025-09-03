-- Fix search path security warnings for existing functions
-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;

-- Update update_book_rating function
CREATE OR REPLACE FUNCTION public.update_book_rating(book_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update handle_diary_entry_rating_change function
CREATE OR REPLACE FUNCTION public.handle_diary_entry_rating_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;