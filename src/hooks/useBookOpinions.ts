import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBookOpinions = (bookId: string) => {
  return useQuery({
    queryKey: ["book-opinions", bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("id, notes, rating, user_id, updated_at")
        .eq("book_id", bookId)
        .not("notes", "is", null)
        .not("rating", "is", null)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all opinion authors
      const userIds = [...new Set((data || []).map((d) => d.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.id, p])
      );

      return (data || []).map((entry) => ({
        id: entry.id,
        notes: entry.notes,
        rating: entry.rating,
        userId: entry.user_id,
        updatedAt: entry.updated_at,
        profile: profileMap.get(entry.user_id) || null,
      }));
    },
    enabled: !!bookId,
  });
};
