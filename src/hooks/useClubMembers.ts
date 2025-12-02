import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClubMembers = (clubId: string) => {
  return useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      // Сначала получаем участников
      const { data: members, error: membersError } = await supabase
        .from('club_members')
        .select('*')
        .eq('club_id', clubId)
        .order('joined_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching club members:', membersError);
        throw membersError;
      }

      if (!members || members.length === 0) {
        return [];
      }

      // Затем получаем профили для этих пользователей
      const userIds = members.map(emp => emp.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Объединяем данные
      const membersWithProfiles = members.map(member => ({
        ...member,
        profiles: profiles?.find(profile => profile.id === member.user_id) || null
      }));

      return membersWithProfiles;
    },
    enabled: !!clubId,
  });
};

export const useClubStats = (clubId: string) => {
  return useQuery({
    queryKey: ['club-stats', clubId],
    queryFn: async () => {
      // Get member count
      const { data: members, error: membersError } = await supabase
        .from('club_members')
        .select('*', { count: 'exact' })
        .eq('club_id', clubId);

      if (membersError) {
        console.error('Error fetching member count:', membersError);
        throw membersError;
      }

      // Get popular books for the club
      const { data: clubBooks, error: booksError } = await supabase
        .from('club_books')
        .select('*, books(*)')
        .eq('club_id', clubId)
        .order('added_at', { ascending: false })
        .limit(3);

      if (booksError) {
        console.error('Error fetching club books:', booksError);
        throw booksError;
      }

      return {
        memberCount: members?.length || 0,
        topBooks: clubBooks?.map(cb => cb.books) || [],
        activeReaders: members?.length || 0,
      };
    },
    enabled: !!clubId,
  });
};
