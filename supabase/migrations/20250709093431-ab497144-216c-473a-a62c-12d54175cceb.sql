
-- Создаем таблицу для записей дневника чтения
CREATE TABLE public.diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'reading' CHECK (status IN ('reading', 'completed', 'paused', 'want_to_read')),
  pages_read INTEGER DEFAULT 0,
  notes TEXT,
  quotes TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Включаем Row Level Security для таблицы записей дневника
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
CREATE POLICY "Users can view their own diary entries" 
  ON public.diary_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries" 
  ON public.diary_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" 
  ON public.diary_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" 
  ON public.diary_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX idx_diary_entries_book_id ON public.diary_entries(book_id);
CREATE INDEX idx_diary_entries_status ON public.diary_entries(status);
