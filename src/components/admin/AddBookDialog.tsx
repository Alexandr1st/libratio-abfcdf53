import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookFormData {
  title: string;
  author: string;
  genre: string;
  description?: string;
  image?: string;
  pages?: number;
  year?: number;
}

const AddBookDialog = ({ open, onOpenChange }: AddBookDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<BookFormData>();

  const addBookMutation = useMutation({
    mutationFn: async (formData: BookFormData) => {
      const { data, error } = await supabase
        .from("books")
        .insert({
          title: formData.title,
          author: formData.author,
          genre: formData.genre,
          description: formData.description || null,
          image: formData.image || null,
          pages: formData.pages || null,
          year: formData.year || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      toast({
        title: "Книга добавлена",
        description: "Книга успешно добавлена в каталог",
      });
      reset();
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

  const onSubmit = (data: BookFormData) => {
    addBookMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить книгу</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="Название книги"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Автор *</Label>
              <Input
                id="author"
                {...register("author", { required: true })}
                placeholder="Автор книги"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Жанр *</Label>
              <Input
                id="genre"
                {...register("genre", { required: true })}
                placeholder="Жанр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Год издания</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
                placeholder="2024"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pages">Страниц</Label>
              <Input
                id="pages"
                type="number"
                {...register("pages", { valueAsNumber: true })}
                placeholder="300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Обложка (URL или эмодзи)</Label>
              <Input
                id="image"
                {...register("image")}
                placeholder="https://... или 📚"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Описание книги"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addBookMutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={addBookMutation.isPending}>
              {addBookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Добавление...
                </>
              ) : (
                "Добавить"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookDialog;
