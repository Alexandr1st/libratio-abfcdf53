import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type CompanyBook = Tables<'company_books'>;

export const useCompanyBooks = (companyId: string) => {
  return useQuery({
    queryKey: ['company-books', companyId],
    queryFn: async (): Promise<CompanyBook[]> => {
      console.log('Fetching company books for company:', companyId);
      
      const { data, error } = await supabase
        .from('company_books')
        .select('*')
        .eq('company_id', companyId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching company books:', error);
        throw error;
      }

      console.log('Company books fetched successfully:', data);
      return data || [];
    },
    enabled: !!companyId,
  });
};

export const useAddBookToCompanyLibrary = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookId }: { bookId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Получаем компанию пользователя
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('contact_person_id', user.id)
        .single();

      if (companyError || !companyData) {
        throw new Error('User is not a company contact person');
      }

      // Проверяем, есть ли уже книга в библиотеке компании
      const { data: existingEntry } = await supabase
        .from('company_books')
        .select('id')
        .eq('company_id', companyData.id)
        .eq('book_id', bookId)
        .single();

      if (existingEntry) {
        throw new Error('Book is already in company library');
      }

      // Добавляем книгу в библиотеку компании
      const { data, error } = await supabase
        .from('company_books')
        .insert({
          company_id: companyData.id,
          book_id: bookId,
          added_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding book to company library:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Инвалидируем кэш для обновления списков
      queryClient.invalidateQueries({ queryKey: ['company-books'] });
      toast({
        title: "Успешно",
        description: "Книга добавлена в библиотеку компании",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить книгу в библиотеку",
        variant: "destructive",
      });
    },
  });
};

export const useCheckBookInCompanyLibrary = (bookId: string) => {
  return useQuery({
    queryKey: ['company-book-check', bookId],
    queryFn: async (): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Получаем компанию пользователя
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('contact_person_id', user.id)
        .single();

      if (companyError || !companyData) {
        return false;
      }

      // Проверяем, есть ли книга в библиотеке компании
      const { data } = await supabase
        .from('company_books')
        .select('id')
        .eq('company_id', companyData.id)
        .eq('book_id', bookId)
        .single();

      return !!data;
    },
    enabled: !!bookId,
  });
};