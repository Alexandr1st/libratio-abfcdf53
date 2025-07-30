
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, Loader2 } from "lucide-react";
import AddToDiaryDropdown from "@/components/AddToDiaryDropdown";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useBooks } from "@/hooks/useBooks";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";

const Books = () => {
  const { data: books, isLoading, error } = useBooks();
  const { data: diaryEntries } = useDiaryEntries();

  console.log('Books data:', books);
  console.log('Books loading:', isLoading);
  console.log('Books error:', error);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DiaryNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DiaryNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">
            Ошибка загрузки книг: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!books || books.length === 0 ? (
          <div className="text-center text-gray-500">
            Книги не найдены
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <CardHeader className="flex items-center space-x-4 p-4">
                  <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center text-2xl">
                    {book.image || "📚"}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">{book.title}</CardTitle>
                    <CardDescription className="text-gray-500">{book.author}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Badge variant="secondary">{book.genre}</Badge>
                  </div>
                  {book.description && (
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {book.description}
                    </div>
                  )}
                  {book.rating && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Рейтинг:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(book.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="ml-1">({book.rating})</span>
                      </div>
                    </div>
                  )}
                  {book.read_by_colleagues && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Читают коллеги: {book.read_by_colleagues}</span>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t">
                  <AddToDiaryDropdown 
                    bookId={book.id} 
                    isInDiary={diaryEntries?.some(entry => entry.book_id === book.id) || false} 
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
