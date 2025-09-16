
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyEmployees = (companyId: string) => {
  return useQuery({
    queryKey: ['company-employees', companyId],
    queryFn: async () => {
      // Сначала получаем сотрудников
      const { data: employees, error: employeesError } = await supabase
        .from('company_employees')
        .select('*')
        .eq('company_id', companyId)
        .order('joined_at', { ascending: false });

      if (employeesError) {
        console.error('Error fetching company employees:', employeesError);
        throw employeesError;
      }

      if (!employees || employees.length === 0) {
        return [];
      }

      // Затем получаем профили для этих пользователей
      const userIds = employees.map(emp => emp.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, position')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Объединяем данные
      const employeesWithProfiles = employees.map(employee => ({
        ...employee,
        profiles: profiles?.find(profile => profile.id === employee.user_id) || null
      }));

      return employeesWithProfiles;
    },
    enabled: !!companyId,
  });
};

export const useCompanyStats = (companyId: string) => {
  return useQuery({
    queryKey: ['company-stats', companyId],
    queryFn: async () => {
      // Get employee count
      const { data: employees, error: employeesError } = await supabase
        .from('company_employees')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId);

      if (employeesError) {
        console.error('Error fetching employee count:', employeesError);
        throw employeesError;
      }

      // Get popular books for the company
      const { data: companyBooks, error: booksError } = await supabase
        .from('company_books')
        .select('*, books(*)')
        .eq('company_id', companyId)
        .order('added_at', { ascending: false })
        .limit(3);

      if (booksError) {
        console.error('Error fetching company books:', booksError);
        throw booksError;
      }

      return {
        employeeCount: employees?.length || 0,
        topBooks: companyBooks?.map(cb => cb.books) || [],
        activeReaders: employees?.length || 0, // Placeholder for now
      };
    },
    enabled: !!companyId,
  });
};
