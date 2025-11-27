
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Company = Tables<'companies'>;
type CompanyInsert = TablesInsert<'companies'>;

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyData, logo }: { companyData: Omit<CompanyInsert, 'logo_url'>; logo?: File | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      let logoUrl = null;

      // Upload logo if provided
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('club-logos')
          .upload(fileName, logo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('club-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          logo_url: logoUrl,
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      // Add user as company admin
      const { error: employeeError } = await supabase
        .from('company_employees')
        .insert({
          company_id: company.id,
          user_id: user.id,
          is_admin: true,
          position: "Администратор",
        });

      if (employeeError) {
        throw employeeError;
      }

      // Update user profile with company info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_id: company.id,
          company: companyData.name,
          position: "Администратор",
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Успешно!",
        description: "Компания создана и вы добавлены как администратор",
      });
    },
    onError: (error) => {
      console.error('Error creating company:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать компанию",
        variant: "destructive",
      });
    },
  });
};

export const useJoinCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId, position }: { companyId: string; position?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('company_employees')
        .insert({
          company_id: companyId,
          user_id: user.id,
          position: position || null,
          is_admin: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error joining company:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Успешно!",
        description: "Вы присоединились к компании",
      });
    },
    onError: (error: any) => {
      console.error('Error joining company:', error);
      if (error.code === '23505') {
        toast({
          title: "Уже участник",
          description: "Вы уже участник этой компании",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось присоединиться к компании",
          variant: "destructive",
        });
      }
    },
  });
};
