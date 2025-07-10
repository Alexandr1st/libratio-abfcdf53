
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyEmployees = (companyId: string) => {
  return useQuery({
    queryKey: ['company-employees', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_employees')
        .select('*, profiles(*)')
        .eq('company_id', companyId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching company employees:', error);
        throw error;
      }

      return data || [];
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
