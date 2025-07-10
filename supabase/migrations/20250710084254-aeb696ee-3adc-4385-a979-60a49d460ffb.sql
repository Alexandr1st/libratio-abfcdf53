
-- Создаем таблицу компаний
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  location TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу для связи пользователей с компаниями (сотрудники)
CREATE TABLE public.company_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  position TEXT,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Создаем таблицу для связи компаний с книгами
CREATE TABLE public.company_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(company_id, book_id)
);

-- Добавляем поле company_id в таблицу profiles для связи пользователя с компанией
ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- Включаем RLS для всех новых таблиц
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_books ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы companies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Company admins can update companies" ON public.companies FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.company_employees 
    WHERE company_id = companies.id 
    AND user_id = auth.uid() 
    AND is_admin = true
  )
);

-- Политики для таблицы company_employees
CREATE POLICY "Anyone can view company employees" ON public.company_employees FOR SELECT USING (true);
CREATE POLICY "Company admins can manage employees" ON public.company_employees FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.company_employees ce 
    WHERE ce.company_id = company_employees.company_id 
    AND ce.user_id = auth.uid() 
    AND ce.is_admin = true
  )
);
CREATE POLICY "Users can join companies" ON public.company_employees FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Политики для таблицы company_books
CREATE POLICY "Anyone can view company books" ON public.company_books FOR SELECT USING (true);
CREATE POLICY "Company employees can manage books" ON public.company_books FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.company_employees 
    WHERE company_id = company_books.company_id 
    AND user_id = auth.uid()
  )
);
