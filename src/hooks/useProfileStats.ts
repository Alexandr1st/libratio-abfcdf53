import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No authenticated user');

      // Получаем статистику по прочитанным книгам
      const { count: booksRead } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Получаем количество отзывов (записи с рейтингом)
      const { count: reviews } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('rating', 'is', null);

      return {
        booksRead: booksRead || 0,
        reviews: reviews || 0,
      };
    },
    enabled: !!user,
  });
};