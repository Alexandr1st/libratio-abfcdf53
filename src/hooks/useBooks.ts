
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Book = Tables<'books'>;

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: async (): Promise<Book[]> => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useSearchBooks = (searchTerm: string, selectedGenre: string) => {
  return useQuery({
    queryKey: ['books', 'search', searchTerm, selectedGenre],
    queryFn: async (): Promise<Book[]> => {
      let query = supabase.from('books').select('*');

      // Фильтрация по поиску
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
      }

      // Фильтрация по жанру
      if (selectedGenre && selectedGenre !== 'Все') {
        query = query.eq('genre', selectedGenre);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error searching books:', error);
        throw error;
      }

      return data || [];
    },
    enabled: searchTerm.length > 0 || selectedGenre !== 'Все', // Only run if there's a search term or genre filter
  });
};
