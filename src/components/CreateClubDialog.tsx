import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateClub } from "@/hooks/useClubs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ClubFormData {
  name: string;
  description?: string;
  location?: string;
  club_type: string;
  logo?: File;
}

interface CreateClubDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CreateClubDialog = ({ open, setOpen }: CreateClubDialogProps) => {
  const createClub = useCreateClub();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<ClubFormData>({
    defaultValues: {
      name: "",
      description: "",
      location: "",
      club_type: "online",
    },
  });

  const onSubmit = async (data: ClubFormData) => {
    try {
      await createClub.mutateAsync({ 
        clubData: {
          name: data.name,
          description: data.description || null,
          location: data.location || null,
          club_type: data.club_type,
        },
        logo: logoFile 
      });
      setOpen(false);
      form.reset();
      setLogoFile(null);
    } catch (error) {
      console.error("Error creating club:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Регистрация нового клуба</DialogTitle>
          <DialogDescription>
            Заполните информацию о вашем клубе для создания читательского сообщества.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Название клуба обязательно" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название клуба *</FormLabel>
                  <FormControl>
                    <Input placeholder="Книжный клуб 'Читатели'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Местоположение</FormLabel>
                  <FormControl>
                    <Input placeholder="Москва, Россия" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="club_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип клуба</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип клуба" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="online">🌐 Онлайн</SelectItem>
                      <SelectItem value="offline">📍 Оффлайн</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Логотип клуба</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLogoFile(file);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание клуба</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Расскажите о вашем клубе..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createClub.isPending}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={createClub.isPending}>
                {createClub.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать клуб"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClubDialog;
