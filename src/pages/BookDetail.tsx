import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, BookOpen, Calendar, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookReadersCount } from "@/hooks/useBookReaders";
import { useAuth } from "@/contexts/AuthContext";
import { useBookDiaryEntry, useUpdateBookDiaryEntry } from "@/hooks/useBookDiaryEntry";
import MyOpinionBlock from "@/components/book/MyOpinionBlock";
import MyQuotesBlock from "@/components/book/MyQuotesBlock";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: readersCount = 0 } = useBookReadersCount(id || '');
  const { data: diaryEntry, isLoading: isDiaryLoading } = useBookDiaryEntry(id || '');
  const updateDiaryEntry = useUpdateBookDiaryEntry();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DiaryNavigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <DiaryNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            Книга не найдена
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DiaryNavigation />
      <div className="container mx-auto px-4 py-8">
        <Link to="/books">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к каталогу
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="md:col-span-1">
            {book.image && (book.image.startsWith('http://') || book.image.startsWith('https://')) ? (
              <img
                src={book.image}
                alt={book.title}
                className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]"
              />
            ) : (
              <div className="w-full rounded-lg bg-muted flex items-center justify-center aspect-[2/3]">
                {book.image ? (
                  <span className="text-6xl">{book.image}</span>
                ) : (
                  <BookOpen className="h-20 w-20 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground">{book.author}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{book.genre}</Badge>
              {book.year && (
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {book.year}
                </Badge>
              )}
              {book.pages && (
                <Badge variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  {book.pages} стр.
                </Badge>
              )}
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Рейтинг:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(book.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2 font-medium">({book.rating || 0})</span>
                  </div>
                </div>

                {/* Readers */}
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Читают:</span>
                  <span className="font-medium">{readersCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {book.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Описание</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* Personal blocks for authenticated users */}
            {user && !isDiaryLoading && (
              <div className="space-y-6 pt-4 border-t">
                <MyOpinionBlock
                  notes={diaryEntry?.notes || null}
                  onSave={(notes) => updateDiaryEntry.mutate({ bookId: id!, updates: { notes } })}
                  isSaving={updateDiaryEntry.isPending}
                />
                <MyQuotesBlock
                  quotes={diaryEntry?.quotes || null}
                  onSave={(quotes) => updateDiaryEntry.mutate({ bookId: id!, updates: { quotes } })}
                  isSaving={updateDiaryEntry.isPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
