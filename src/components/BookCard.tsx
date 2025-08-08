import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock } from "lucide-react";
import AddToDiaryDropdown from "@/components/AddToDiaryDropdown";
import AddToCompanyLibraryDropdown from "@/components/AddToCompanyLibraryDropdown";
import { useCheckBookInCompanyLibrary } from "@/hooks/useCompanyBooks";
import type { Tables } from '@/integrations/supabase/types';

type Book = Tables<'books'>;

interface BookCardProps {
  book: Book;
  isInDiary: boolean;
  isCompanyProfile: boolean;
}

const BookCard = ({ book, isInDiary, isCompanyProfile }: BookCardProps) => {
  const { data: isInCompanyLibrary = false } = useCheckBookInCompanyLibrary(book.id);

  return (
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
      <div className="p-4 border-t space-y-2">
        {isCompanyProfile ? (
          <AddToCompanyLibraryDropdown 
            bookId={book.id} 
            isInLibrary={isInCompanyLibrary} 
          />
        ) : (
          <AddToDiaryDropdown 
            bookId={book.id} 
            isInDiary={isInDiary} 
          />
        )}
      </div>
    </Card>
  );
};

export default BookCard;