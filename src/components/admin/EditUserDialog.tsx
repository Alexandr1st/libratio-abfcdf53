import { useEffect } from "react";
import { useForm } from "react-hook-form";
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

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    full_name: string | null;
    username: string | null;
    position: string | null;
    company_id: string | null;
  } | null;
}

interface UserFormData {
  full_name: string;
  username: string;
  position: string;
  company_id: string;
}

const EditUserDialog = ({ open, onOpenChange, user }: EditUserDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<UserFormData>();

  const companyId = watch("company_id");

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
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
        position: user.position || "",
        company_id: user.company_id || "",
      });
    }
  }, [user, reset]);

  const updateUserMutation = useMutation({
    mutationFn: async (formData: UserFormData) => {
      if (!user) return;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          username: formData.username,
          position: formData.position,
          company_id: formData.company_id || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update company_employees if company is selected
      if (formData.company_id) {
        // Check if employee record exists
        const { data: existingEmployee } = await supabase
          .from("company_employees")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingEmployee) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("company_employees")
            .update({ company_id: formData.company_id })
            .eq("user_id", user.id);
          
          if (updateError) throw updateError;
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from("company_employees")
            .insert({
              user_id: user.id,
              company_id: formData.company_id,
            });
          
          if (insertError) throw insertError;
        }
      } else {
        // Remove from company_employees if no company selected
        await supabase
          .from("company_employees")
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

  const onSubmit = (data: UserFormData) => {
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="ivan_ivanov"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input
              id="position"
              {...register("position")}
              placeholder="Разработчик"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">Компания</Label>
            <Select
              value={companyId}
              onValueChange={(value) => setValue("company_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите компанию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Нет компании</SelectItem>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
