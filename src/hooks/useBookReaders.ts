import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookReadersCount = (bookId: string) => {
  return useQuery({
    queryKey: ['book-readers-count', bookId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId)
        .eq('status', 'reading');

      if (error) {
        console.error('Error fetching readers count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!bookId,
  });
};
