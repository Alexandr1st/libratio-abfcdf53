import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBookDiaryEntry = (bookId: string) => {
  return useQuery({
    queryKey: ["book-diary-entry", bookId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("book_id", bookId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });
};

export const useUpdateBookDiaryEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      bookId,
      updates,
    }: {
      bookId: string;
      updates: { notes?: string; quotes?: string[] };
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      // Check if entry exists
      const { data: existing } = await supabase
        .from("diary_entries")
        .select("id")
        .eq("book_id", bookId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing entry
        const { data, error } = await supabase
          .from("diary_entries")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from("diary_entries")
          .insert({
            book_id: bookId,
            user_id: user.id,
            status: "reading",
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["book-diary-entry", variables.bookId],
      });
      queryClient.invalidateQueries({ queryKey: ["diary-entries"] });
      toast({
        title: "Сохранено!",
        description: "Ваши заметки обновлены",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить",
        variant: "destructive",
      });
    },
  });
};
