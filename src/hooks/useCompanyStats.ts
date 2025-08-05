import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyStats = (companyId: string | null) => {
  return useQuery({
    queryKey: ['company-stats', companyId],
    queryFn: async () => {
      if (!companyId) throw new Error('No company ID provided');

      // Получаем всех сотрудников компании
      const { data: employees, error: employeesError } = await supabase
        .from('company_employees')
        .select('user_id')
        .eq('company_id', companyId);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        throw employeesError;
      }

      const employeeIds = employees?.map(emp => emp.user_id) || [];

      if (employeeIds.length === 0) {
        return {
          booksRead: 0,
          reviews: 0,
          employees: []
        };
      }

      // Получаем количество прочитанных книг всеми сотрудниками
      const { count: booksRead } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .in('user_id', employeeIds)
        .eq('status', 'completed');

      // Получаем количество отзывов всех сотрудников
      const { count: reviews } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .in('user_id', employeeIds)
        .not('rating', 'is', null);

      // Получаем информацию о сотрудниках
      const { data: employeeProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, position, avatar_url')
        .in('id', employeeIds)
        .limit(6); // Ограничиваем до 6 сотрудников для отображения

      if (profilesError) {
        console.error('Error fetching employee profiles:', profilesError);
        throw profilesError;
      }

      return {
        booksRead: booksRead || 0,
        reviews: reviews || 0,
        employees: employeeProfiles || [],
        totalEmployees: employees?.length || 0
      };
    },
    enabled: !!companyId,
  });
};