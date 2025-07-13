
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookNote {
  id: string;
  user_id: string;
  book_id: string;
  diary_entry_id: string;
  page_number?: number;
  note_content: string;
  created_at: string;
  updated_at: string;
}

interface CreateBookNoteParams {
  bookId: string;
  diaryEntryId: string;
  pageNumber?: number;
  noteContent: string;
}

export const useBookNotes = (diaryEntryId?: string) => {
  return useQuery({
    queryKey: ['book-notes', diaryEntryId],
    queryFn: async (): Promise<BookNote[]> => {
      if (!diaryEntryId) return [];
      
      const { data, error } = await supabase
        .from('book_notes')
        .select('*')
        .eq('diary_entry_id', diaryEntryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching book notes:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!diaryEntryId,
  });
};

export const useCreateBookNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookId, diaryEntryId, pageNumber, noteContent }: CreateBookNoteParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('book_notes')
        .insert({
          user_id: user.id,
          book_id: bookId,
          diary_entry_id: diaryEntryId,
          page_number: pageNumber || null,
          note_content: noteContent,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating book note:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-notes'] });
      toast({
        title: "Заметка добавлена!",
        description: "Ваша заметка успешно сохранена",
      });
    },
    onError: (error) => {
      console.error('Error creating book note:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить заметку",
        variant: "destructive",
      });
    },
  });
};
