import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clubSchema, getFirstError } from '@/lib/validations';

interface Club {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  logo_url: string | null;
  website: string | null;
  contact_person_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ClubInsert {
  name: string;
  description?: string | null;
  location?: string | null;
  logo_url?: string | null;
  website?: string | null;
}

export const useClubs = () => {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async (): Promise<Club[]> => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clubs:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateClub = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clubData, logo }: { clubData: Omit<ClubInsert, 'logo_url'>; logo?: File | null }) => {
      // Validate club data
      const validationResult = clubSchema.safeParse(clubData);
      if (!validationResult.success) {
        throw new Error(getFirstError(validationResult.error));
      }

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

      // Create club with validated data
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: validationResult.data.name,
          description: validationResult.data.description,
          location: validationResult.data.location,
          website: validationResult.data.website,
          logo_url: logoUrl,
        })
        .select()
        .single();

      if (clubError) {
        throw clubError;
      }

      // Add user as club admin
      const { error: memberError } = await supabase
        .from('club_members')
        .insert({
          club_id: club.id,
          user_id: user.id,
          is_admin: true,
          position: "Администратор",
        });

      if (memberError) {
        throw memberError;
      }

      // Update user profile with club info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          club_id: club.id,
          club_name: clubData.name,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      return club;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Успешно!",
        description: "Клуб создан и вы добавлены как администратор",
      });
    },
    onError: (error) => {
      console.error('Error creating club:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать клуб",
        variant: "destructive",
      });
    },
  });
};

export const useJoinClub = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clubId, position }: { clubId: string; position?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate position if provided
      if (position && position.length > 100) {
        throw new Error('Позиция должна быть не более 100 символов');
      }

      const { data, error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: user.id,
          position: position ? position.slice(0, 100) : null,
          is_admin: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error joining club:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Успешно!",
        description: "Вы присоединились к клубу",
      });
    },
    onError: (error: any) => {
      console.error('Error joining club:', error);
      if (error.code === '23505') {
        toast({
          title: "Уже участник",
          description: "Вы уже участник этого клуба",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось присоединиться к клубу",
          variant: "destructive",
        });
      }
    },
  });
};
