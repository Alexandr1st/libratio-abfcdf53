
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type DiaryEntry = Tables<'diary_entries'>;
type DiaryEntryInsert = TablesInsert<'diary_entries'>;

export const useDiaryEntries = () => {
  return useQuery({
    queryKey: ['diary-entries'],
    queryFn: async (): Promise<DiaryEntry[]> => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*, books(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching diary entries:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useAddBookToDiary = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookId, status = 'want_to_read' }: { bookId: string; status?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const diaryEntry: DiaryEntryInsert = {
        user_id: user.id,
        book_id: bookId,
        status,
      };

      const { data, error } = await supabase
        .from('diary_entries')
        .insert(diaryEntry)
        .select('*, books(*)')
        .single();

      if (error) {
        console.error('Error adding book to diary:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast({
        title: "Успешно!",
        description: "Книга добавлена в ваш читательский дневник",
      });
    },
    onError: (error: any) => {
      console.error('Error adding book to diary:', error);
      if (error.code === '23505') {
        toast({
          title: "Книга уже в дневнике",
          description: "Эта книга уже добавлена в ваш читательский дневник",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить книгу в дневник",
          variant: "destructive",
        });
      }
    },
  });
};

export const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DiaryEntry> }) => {
      const { data, error } = await supabase
        .from('diary_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, books(*)')
        .single();

      if (error) {
        console.error('Error updating diary entry:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast({
        title: "Обновлено!",
        description: "Запись в дневнике обновлена",
      });
    },
    onError: (error) => {
      console.error('Error updating diary entry:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить запись",
        variant: "destructive",
      });
    },
  });
};
