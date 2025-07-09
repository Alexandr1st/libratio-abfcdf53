
-- Создаем таблицу для книг
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  description TEXT,
  pages INTEGER CHECK (pages > 0),
  year INTEGER CHECK (year > 0),
  image TEXT,
  read_by_colleagues INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем Row Level Security для таблицы книг
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Создаем политику, позволяющую всем пользователям просматривать книги
CREATE POLICY "Anyone can view books" 
  ON public.books 
  FOR SELECT 
  USING (true);

-- Создаем политику, позволяющую аутентифицированным пользователям добавлять книги
CREATE POLICY "Authenticated users can insert books" 
  ON public.books 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Создаем политику, позволяющую аутентифицированным пользователям обновлять книги
CREATE POLICY "Authenticated users can update books" 
  ON public.books 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Вставляем тестовые данные
INSERT INTO public.books (title, author, genre, rating, description, pages, year, image, read_by_colleagues) VALUES
('Чистый код', 'Роберт Мартин', 'Программирование', 4.8, 'Руководство по написанию качественного программного кода', 464, 2008, '📚', 45),
('Архитектор ПО на практике', 'Лен Басс', 'Архитектура ПО', 4.6, 'Практическое руководство по архитектуре программного обеспечения', 512, 2012, '🏗️', 23),
('Психология влияния', 'Роберт Чалдини', 'Психология', 4.9, 'Классическая книга о принципах влияния и убеждения', 336, 2006, '🧠', 67),
('Lean Startup', 'Эрик Рис', 'Бизнес', 4.7, 'Методология создания успешных стартапов', 336, 2011, '🚀', 34),
('Дизайн повседневных вещей', 'Дон Норман', 'Дизайн', 4.5, 'Основы пользовательского опыта и дизайна интерфейсов', 368, 2013, '🎨', 28),
('Сначала скажите НЕТ', 'Джим Кэмп', 'Переговоры', 4.4, 'Система переговоров, основанная на эмоциональном интеллекте', 352, 2002, '💼', 19);
