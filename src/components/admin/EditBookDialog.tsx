import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { bookSchema, getFirstError } from "@/lib/validations";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description?: string;
  image?: string;
  pages?: number;
  year?: number;
}

interface EditBookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBookDialog = ({ book, open, onOpenChange }: EditBookDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    image: "",
    pages: "",
    year: "",
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        genre: book.genre || "",
        description: book.description || "",
        image: book.image || "",
        pages: book.pages?.toString() || "",
        year: book.year?.toString() || "",
      });
    }
  }, [book]);

  const updateBookMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!book) return;

      // Validate with zod schema
      const validationResult = bookSchema.safeParse({
        title: data.title,
        author: data.author,
        genre: data.genre,
        description: data.description || null,
        image: data.image || null,
        pages: data.pages ? parseInt(data.pages) : null,
        year: data.year ? parseInt(data.year) : null,
      });

      if (!validationResult.success) {
        throw new Error(getFirstError(validationResult.error));
      }

      const { error } = await supabase
        .from("books")
        .update({
          title: data.title,
          author: data.author,
          genre: data.genre,
          description: data.description || null,
          image: data.image || null,
          pages: data.pages ? parseInt(data.pages) : null,
          year: data.year ? parseInt(data.year) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", book.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      toast({
        title: "Книга обновлена",
        description: "Информация о книге успешно обновлена",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить книгу: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать книгу</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={500}
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Автор *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              maxLength={200}
              required
            />
          </div>

          <div>
            <Label htmlFor="genre">Жанр *</Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div>
            <Label htmlFor="image">URL изображения</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pages">Количество страниц</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                min="1"
                max="50000"
              />
            </div>

            <div>
              <Label htmlFor="year">Год издания</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                min="1000"
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={updateBookMutation.isPending}>
              {updateBookMutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookDialog;
