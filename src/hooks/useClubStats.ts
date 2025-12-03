import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClubStats = (clubId: string | null) => {
  return useQuery({
    queryKey: ['club-stats', clubId],
    queryFn: async () => {
      if (!clubId) throw new Error('No club ID provided');

      // Получаем всех участников клуба
      const { data: members, error: membersError } = await supabase
        .from('club_members')
        .select('user_id')
        .eq('club_id', clubId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      const memberIds = members?.map(m => m.user_id) || [];

      if (memberIds.length === 0) {
        return {
          booksRead: 0,
          reviews: 0,
          members: []
        };
      }

      // Получаем количество прочитанных книг всеми участниками
      const { count: booksRead } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .in('user_id', memberIds)
        .eq('status', 'completed');

      // Получаем количество отзывов всех участников
      const { count: reviews } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .in('user_id', memberIds)
        .not('rating', 'is', null);

      // Получаем информацию об участниках
      const { data: memberProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', memberIds)
        .limit(6);

      if (profilesError) {
        console.error('Error fetching member profiles:', profilesError);
        throw profilesError;
      }

      return {
        booksRead: booksRead || 0,
        reviews: reviews || 0,
        members: memberProfiles || [],
        totalMembers: members?.length || 0
      };
    },
    enabled: !!clubId,
  });
};