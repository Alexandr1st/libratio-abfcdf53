import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bookSchema, type BookFormData } from "@/lib/validations";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddBookDialog = ({ open, onOpenChange }: AddBookDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      genre: '',
      description: null,
      image: null,
      pages: null,
      year: null,
    }
  });

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
          pages: typeof formData.pages === 'number' ? formData.pages : null,
          year: typeof formData.year === 'number' ? formData.year : null,
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
          <DialogDescription>
            Добавьте новую книгу в каталог системы
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Название книги"
                maxLength={500}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Автор *</Label>
              <Input
                id="author"
                {...register("author")}
                placeholder="Автор книги"
                maxLength={200}
              />
              {errors.author && (
                <p className="text-sm text-destructive">{errors.author.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Жанр *</Label>
              <Input
                id="genre"
                {...register("genre")}
                placeholder="Жанр"
                maxLength={100}
              />
              {errors.genre && (
                <p className="text-sm text-destructive">{errors.genre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Год издания</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
                placeholder="2024"
                min={1000}
                max={new Date().getFullYear() + 5}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
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
                min={1}
                max={50000}
              />
              {errors.pages && (
                <p className="text-sm text-destructive">{errors.pages.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Обложка (URL или эмодзи)</Label>
              <Input
                id="image"
                {...register("image")}
                placeholder="https://... или 📚"
                maxLength={1000}
              />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Описание книги"
              rows={4}
              maxLength={2000}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
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
