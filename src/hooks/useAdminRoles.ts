import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useIsAdmin = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data;
    },
    enabled: !!user,
  });
};

export const useAdminRoles = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["adminRoles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_roles")
        .select(`
          *,
          profiles!admin_roles_user_id_fkey(full_name, username)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAssignAdminRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from("admin_roles")
        .insert({
          user_id: userId,
          role: role,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
    },
  });
};

export const useRemoveAdminRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("admin_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
    },
  });
};