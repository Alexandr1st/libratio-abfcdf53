import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Book, Upload, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const AVAILABLE_GENRES = [
  "драма",
  "комедия",
  "трагедия",
  "сказка",
  "повесть",
  "рассказ",
  "роман",
  "бизнес",
  "личный рост",
];

const AdminBookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genrePopoverOpen, setGenrePopoverOpen] = useState(false);

  const { data: book, isLoading, error } = useQuery({
    queryKey: ["adminBook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          diary_entries(id),
          company_books(id, companies(name))
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (book) {
      const genres = book.genre ? book.genre.split(",").map(g => g.trim()) : [];
      setSelectedGenres(genres);
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

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => {
      const newGenres = prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre];
      setFormData({ ...formData, genre: newGenres.join(", ") });
      return newGenres;
    });
  };

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = data.image;

      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
        setIsUploading(false);
      }

      const { error } = await supabase
        .from("books")
        .update({
          title: data.title,
          author: data.author,
          genre: data.genre,
          description: data.description,
          image: imageUrl,
          pages: data.pages ? parseInt(data.pages) : null,
          year: data.year ? parseInt(data.year) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBook", id] });
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      toast.success("Книга успешно обновлена");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !book) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Ошибка загрузки книги</p>
            <Button onClick={() => navigate("/admin/books")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к списку
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/books")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Редактирование книги</h1>
            <p className="text-gray-600">{book.title}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Автор</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Жанр</Label>
                    <Popover open={genrePopoverOpen} onOpenChange={setGenrePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={genrePopoverOpen}
                          className={cn(
                            "w-full justify-between font-normal",
                            !selectedGenres.length && "text-muted-foreground"
                          )}
                        >
                          {selectedGenres.length > 0
                            ? `Выбрано: ${selectedGenres.length}`
                            : "Выберите жанры"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 bg-background" align="start">
                        <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                          {AVAILABLE_GENRES.map((genre) => (
                            <div key={genre} className="flex items-center space-x-2">
                              <Checkbox
                                id={genre}
                                checked={selectedGenres.includes(genre)}
                                onCheckedChange={() => handleGenreToggle(genre)}
                              />
                              <label
                                htmlFor={genre}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {genre}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {selectedGenres.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedGenres.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pages">Страниц</Label>
                    <Input
                      id="pages"
                      type="number"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Год</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover-file">Загрузить обложку</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cover-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <span className="text-sm text-muted-foreground">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Или укажите URL обложки</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>

                <Button type="submit" disabled={updateMutation.isPending || isUploading}>
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Рейтинг</p>
                  <p className="text-2xl font-bold">{book.rating?.toFixed(1) || "Н/Д"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Читателей</p>
                  <p className="text-2xl font-bold">{book.diary_entries?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">В библиотеках компаний</p>
                  <p className="text-2xl font-bold">{book.company_books?.length || 0}</p>
                </div>
              </CardContent>
            </Card>

            {book.image && (
              <Card>
                <CardHeader>
                  <CardTitle>Обложка</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-auto rounded-lg"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookDetail;
