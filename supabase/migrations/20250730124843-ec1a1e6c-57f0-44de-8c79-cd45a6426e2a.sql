-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  company TEXT,
  position TEXT,
  location TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  location TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS policies for companies
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (true);

-- Create company_employees table
CREATE TABLE public.company_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  position TEXT,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on company_employees
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_employees
CREATE POLICY "Anyone can view company employees" 
ON public.company_employees 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join companies" 
ON public.company_employees 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT NOT NULL,
  description TEXT,
  image TEXT,
  pages INTEGER,
  year INTEGER,
  rating NUMERIC,
  read_by_colleagues INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- RLS policies for books
CREATE POLICY "Anyone can view books" 
ON public.books 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert books" 
ON public.books 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update books" 
ON public.books 
FOR UPDATE 
USING (true);

-- Create diary_entries table
CREATE TABLE public.diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'reading',
  pages_read INTEGER DEFAULT 0,
  rating INTEGER,
  notes TEXT,
  quotes TEXT[],
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on diary_entries
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for diary_entries
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

-- Create book_notes table
CREATE TABLE public.book_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  diary_entry_id UUID NOT NULL,
  page_number INTEGER,
  note_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on book_notes
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for book_notes
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

-- Create company_books table
CREATE TABLE public.company_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  book_id UUID NOT NULL,
  added_by UUID,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on company_books
ALTER TABLE public.company_books ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_books
CREATE POLICY "Anyone can view company books" 
ON public.company_books 
FOR SELECT 
USING (true);

CREATE POLICY "Company employees can manage books" 
ON public.company_books 
FOR ALL 
USING (EXISTS (
  SELECT 1
  FROM company_employees
  WHERE company_employees.company_id = company_books.company_id 
  AND company_employees.user_id = auth.uid()
));

-- Add missing RLS policies for companies
CREATE POLICY "Company admins can update companies" 
ON public.companies 
FOR UPDATE 
USING (EXISTS (
  SELECT 1
  FROM company_employees
  WHERE company_employees.company_id = companies.id 
  AND company_employees.user_id = auth.uid() 
  AND company_employees.is_admin = true
));

-- Add missing RLS policy for company_employees
CREATE POLICY "Company admins can manage employees" 
ON public.company_employees 
FOR ALL 
USING (EXISTS (
  SELECT 1
  FROM company_employees ce
  WHERE ce.company_id = company_employees.company_id 
  AND ce.user_id = auth.uid() 
  AND ce.is_admin = true
));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_notes_updated_at
  BEFORE UPDATE ON public.book_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();