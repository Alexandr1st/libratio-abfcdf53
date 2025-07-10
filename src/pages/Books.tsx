
import { useState } from "react";
import { useBooks } from "@/hooks/useBooks";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Star, Users, Calendar, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AddToDiaryDropdown from "@/components/AddToDiaryDropdown";

const Books = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  
  const { data: books, isLoading, error } = useBooks();
  const { data: diaryEntries } = useDiaryEntries();

  // Get unique genres from books
  const genres = books ? ["all", ...new Set(books.map(book => book.genre))] : ["all"];

  // Filter books based on search term and genre
  const filteredBooks = books?.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  }) || [];

  // Check if book is already in diary
  const isBookInDiary = (bookId: string) => {
    return diaryEntries?.some(entry => entry.book_id === bookId) || false;
  };

  if (error) {
    console.error('Error loading books:', error);
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
                <Button variant="ghost" className="text-blue-600 bg-blue-50">Каталог книг</Button>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Каталог книг</h1>
            <p className="text-lg text-gray-600">Откройте для себя новые книги и добавьте их в свой читательский дневник</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Поиск по названию или автору..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre === "all" ? "Все жанры" : genre}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Загрузка каталога...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-600 mb-2">Ошибка загрузки</h3>
            <p className="text-red-400">Не удалось загрузить каталог книг</p>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{book.image || '📚'}</div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                        <CardDescription className="text-base font-medium text-gray-700">
                          {book.author}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{book.genre}</Badge>
                      {book.year && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{book.year}</span>
                        </div>
                      )}
                    </div>

                    {book.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      {book.pages && (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{book.pages} стр.</span>
                        </div>
                      )}
                      {book.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{book.rating}</span>
                        </div>
                      )}
                    </div>

                    {book.read_by_colleagues && book.read_by_colleagues > 0 && (
                      <div className="flex items-center space-x-1 text-sm text-blue-600">
                        <Users className="h-4 w-4" />
                        <span>Прочитали {book.read_by_colleagues} коллег</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <AddToDiaryDropdown 
                        bookId={book.id} 
                        isInDiary={isBookInDiary(book.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">Книги не найдены</h3>
            <p className="text-gray-400">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
