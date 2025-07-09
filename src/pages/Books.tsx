
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Star, Heart, Plus, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useBooks, useSearchBooks } from "@/hooks/useBooks";
import { useAddBookToDiary, useDiaryEntries } from "@/hooks/useDiaryEntries";
import type { Tables } from '@/integrations/supabase/types';

type Book = Tables<'books'>;

const Books = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Все");

  const { data: allBooks, isLoading: isLoadingAll, error: errorAll } = useBooks();
  const { data: searchResults, isLoading: isSearching } = useSearchBooks(searchTerm, selectedGenre);
  const { data: diaryEntries } = useDiaryEntries();
  const addBookToDiary = useAddBookToDiary();

  // Определяем какие книги показывать
  const booksToShow = useMemo(() => {
    if (searchTerm || selectedGenre !== 'Все') {
      return searchResults || [];
    }
    return allBooks || [];
  }, [allBooks, searchResults, searchTerm, selectedGenre]);

  // Получаем уникальные жанры из всех книг
  const genres = useMemo(() => {
    if (!allBooks) return ["Все"];
    const uniqueGenres = Array.from(new Set(allBooks.map(book => book.genre)));
    return ["Все", ...uniqueGenres.sort()];
  }, [allBooks]);

  // Проверяем, добавлена ли книга в дневник
  const isBookInDiary = (bookId: string) => {
    return diaryEntries?.some(entry => entry.book_id === bookId);
  };

  const handleAddToDiary = (bookId: string) => {
    addBookToDiary.mutate({ bookId });
  };

  const isLoading = isLoadingAll || isSearching;

  if (errorAll) {
    console.error('Error loading books:', errorAll);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Libratio</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/books">
                <Button variant="ghost" className="text-blue-600">Каталог книг</Button>
              </Link>
              <Link to="/diary">
                <Button variant="ghost">Мой дневник</Button>
              </Link>
              <Link to="/companies">
                <Button variant="ghost">Компании</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">Профиль</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Каталог книг</h1>
          <p className="text-lg text-gray-600">Откройте для себя новые книги и узнайте, что читают ваши коллеги</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или автору..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Загрузка книг...</span>
          </div>
        )}

        {/* Error State */}
        {errorAll && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-600 mb-2">Ошибка загрузки</h3>
            <p className="text-red-400">Не удалось загрузить каталог книг</p>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && !errorAll && booksToShow.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booksToShow.map((book) => {
              const inDiary = isBookInDiary(book.id);
              
              return (
                <Card key={book.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-4">{book.image || '📚'}</div>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{book.title}</CardTitle>
                    <CardDescription className="text-base">
                      <span className="font-medium">{book.author}</span>
                      {book.year && (
                        <>
                          <span className="text-gray-400 mx-2">•</span>
                          {book.year}
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {book.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        {book.pages && <span>{book.pages} стр.</span>}
                        {book.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{book.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{book.genre}</Badge>
                        {book.read_by_colleagues && book.read_by_colleagues > 0 && (
                          <span className="text-xs text-blue-600">
                            {book.read_by_colleagues} коллег читают
                          </span>
                        )}
                      </div>

                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleAddToDiary(book.id)}
                        disabled={inDiary || addBookToDiary.isPending}
                        variant={inDiary ? "outline" : "default"}
                      >
                        {addBookToDiary.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : inDiary ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        {inDiary ? 'В дневнике' : 'Добавить в дневник'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorAll && booksToShow.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">Книги не найдены</h3>
            <p className="text-gray-400">
              {searchTerm || selectedGenre !== 'Все' 
                ? 'Попробуйте изменить параметры поиска' 
                : 'В каталоге пока нет книг'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
