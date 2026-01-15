import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profileUpdateSchema, type ProfileUpdateFormData } from "@/lib/validations";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    full_name: string | null;
    username: string | null;
    club_id: string | null;
  } | null;
}

const EditUserDialog = ({ open, onOpenChange, user }: EditUserDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    formState: { errors }
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: '',
      username: '',
      club_id: '',
    }
  });

  const clubId = watch("club_id");

  const { data: clubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || "",
        username: user.username || "",
        club_id: user.club_id || "",
      });
    }
  }, [user, reset]);

  const updateUserMutation = useMutation({
    mutationFn: async (formData: ProfileUpdateFormData) => {
      if (!user) return;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          username: formData.username || null,
          club_id: formData.club_id || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update club_members if club is selected
      if (formData.club_id) {
        // Check if member record exists
        const { data: existingMember } = await supabase
          .from("club_members")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingMember) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("club_members")
            .update({ club_id: formData.club_id })
            .eq("user_id", user.id);
          
          if (updateError) throw updateError;
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from("club_members")
            .insert({
              user_id: user.id,
              club_id: formData.club_id,
            });
          
          if (insertError) throw insertError;
        }
      } else {
        // Remove from club_members if no club selected
        await supabase
          .from("club_members")
          .delete()
          .eq("user_id", user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно обновлены",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateFormData) => {
    updateUserMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogDescription>
            Изменить данные пользователя
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Полное имя</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Иван Иванов"
              maxLength={100}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username (буквы, цифры, подчеркивания)</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="ivan_ivanov"
              maxLength={30}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="club_id">Клуб</Label>
            <Select
              value={clubId || "none"}
              onValueChange={(value) => setValue("club_id", value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите клуб" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Нет клуба</SelectItem>
                {clubs?.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.club_id && (
              <p className="text-sm text-destructive">{errors.club_id.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateUserMutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
