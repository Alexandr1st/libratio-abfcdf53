
-- Создаем таблицу для записей о книгах
CREATE TABLE public.book_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  diary_entry_id UUID REFERENCES public.diary_entries(id) ON DELETE CASCADE NOT NULL,
  page_number INTEGER,
  note_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем Row Level Security для таблицы записей о книгах
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
CREATE POLICY "Users can view their own book notes" 
  ON public.book_notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own book notes" 
  ON public.book_notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book notes" 
  ON public.book_notes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book notes" 
  ON public.book_notes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_book_notes_user_id ON public.book_notes(user_id);
CREATE INDEX idx_book_notes_book_id ON public.book_notes(book_id);
CREATE INDEX idx_book_notes_diary_entry_id ON public.book_notes(diary_entry_id);
