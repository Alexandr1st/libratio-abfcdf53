import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClubBooks = (clubId: string) => {
  return useQuery({
    queryKey: ['club-books', clubId],
    queryFn: async () => {
      console.log('Fetching club books for club:', clubId);
      
      const { data, error } = await supabase
        .from('club_books')
        .select('*')
        .eq('club_id', clubId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching club books:', error);
        throw error;
      }

      console.log('Club books fetched successfully:', data);
      return data || [];
    },
    enabled: !!clubId,
  });
};

export const useAddBookToClubLibrary = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookId }: { bookId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Получаем клуб пользователя
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('contact_person_id', user.id)
        .single();

      if (clubError || !clubData) {
        throw new Error('User is not a club contact person');
      }

      // Проверяем, есть ли уже книга в библиотеке клуба
      const { data: existingEntry } = await supabase
        .from('club_books')
        .select('id')
        .eq('club_id', clubData.id)
        .eq('book_id', bookId)
        .single();

      if (existingEntry) {
        throw new Error('Book is already in club library');
      }

      // Добавляем книгу в библиотеку клуба
      const { data, error } = await supabase
        .from('club_books')
        .insert({
          club_id: clubData.id,
          book_id: bookId,
          added_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding book to club library:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-books'] });
      toast({
        title: "Успешно",
        description: "Книга добавлена в библиотеку клуба",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить книгу в библиотеку",
        variant: "destructive",
      });
    },
  });
};

export const useClubBooksWithDetails = (clubId: string) => {
  return useQuery({
    queryKey: ['club-books-details', clubId],
    queryFn: async () => {
      console.log('Fetching club books with details for club:', clubId);
      
      const { data, error } = await supabase
        .from('club_books')
        .select(`
          *,
          books (
            id,
            title,
            author,
            genre,
            image,
            description
          )
        `)
        .eq('club_id', clubId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching club books with details:', error);
        throw error;
      }

      console.log('Club books with details fetched successfully:', data);
      return data || [];
    },
    enabled: !!clubId,
  });
};

export const useCheckBookInClubLibrary = (bookId: string) => {
  return useQuery({
    queryKey: ['club-book-check', bookId],
    queryFn: async (): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Получаем клуб пользователя
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('contact_person_id', user.id)
        .single();

      if (clubError || !clubData) {
        return false;
      }

      // Проверяем, есть ли книга в библиотеке клуба
      const { data } = await supabase
        .from('club_books')
        .select('id')
        .eq('club_id', clubData.id)
        .eq('book_id', bookId)
        .single();

      return !!data;
    },
    enabled: !!bookId,
  });
};
