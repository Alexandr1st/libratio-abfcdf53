import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProfileStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No authenticated user');

      // Count completed books
      const { count: booksRead } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Count opinions (entries with rating)
      const { count: reviews } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('rating', 'is', null);

      // Count books completed THIS year
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const { count: booksReadThisYear } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', yearStart);

      // Fetch reading goal
      const { data: profile } = await supabase
        .from('profiles')
        .select('yearly_reading_goal')
        .eq('id', user.id)
        .single();

      return {
        booksRead: booksRead || 0,
        reviews: reviews || 0,
        booksReadThisYear: booksReadThisYear || 0,
        yearlyReadingGoal: (profile as any)?.yearly_reading_goal as number | null,
      };
    },
    enabled: !!user,
  });
};

export const useUpdateReadingGoal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goal: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ yearly_reading_goal: goal } as any)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
      toast({ title: 'Сохранено!', description: 'Цель на год обновлена' });
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить цель', variant: 'destructive' });
    },
  });
};
