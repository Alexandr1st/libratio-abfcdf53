import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookReadersCount = (bookId: string) => {
  return useQuery({
    queryKey: ['book-readers-count', bookId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId);

      if (error) {
        console.error('Error fetching readers count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!bookId,
  });
};

export const useBookClubsCount = (bookId: string) => {
  return useQuery({
    queryKey: ['book-clubs-count', bookId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('club_books')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId);

      if (error) {
        console.error('Error fetching clubs count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!bookId,
  });
};
