import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentlyReading = () => {
  return useQuery({
    queryKey: ["currently-reading"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("diary_entries")
        .select("*, books(*)")
        .eq("user_id", user.id)
        .eq("status", "reading");

      if (error) throw error;
      return data || [];
    },
  });
};
