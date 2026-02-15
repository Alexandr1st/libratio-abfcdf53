import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, BookOpen } from "lucide-react";
import AddToDiaryDropdown from "@/components/AddToDiaryDropdown";
import AddToClubLibraryDropdown from "@/components/AddToClubLibraryDropdown";
import { useCheckBookInClubLibrary } from "@/hooks/useClubBooks";
import { useBookReadersCount } from "@/hooks/useBookReaders";
import type { Tables } from '@/integrations/supabase/types';

type Book = Tables<'books'>;

interface BookCardProps {
  book: Book;
  isInDiary?: boolean;
  isClubProfile?: boolean;
  hideActions?: boolean;
}

const BookCard = ({ book, isInDiary = false, isClubProfile = false, hideActions = false }: BookCardProps) => {
  const { data: isInClubLibrary = false } = useCheckBookInClubLibrary(book.id);
  const { data: readersCount = 0 } = useBookReadersCount(book.id);

  return (
    <Card key={book.id} className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="flex items-center space-x-4 p-4">
        <div className="w-16 h-24 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
          {book.image && (book.image.startsWith('http://') || book.image.startsWith('https://')) ? (
            <img 
              src={book.image} 
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">{book.image || "📚"}</span>
          )}
        </div>
        <div>
          <Link to={`/books/${book.id}`}>
            <CardTitle className="text-lg font-semibold hover:text-primary hover:underline cursor-pointer">
              {book.title}
            </CardTitle>
          </Link>
          <CardDescription className="text-muted-foreground">{book.author}</CardDescription>
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
        <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4" />
          <span>Рейтинг:</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(book.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
            <span className="ml-1">({book.rating || 0})</span>
          </div>
        </div>
        <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Читают: {readersCount}</span>
        </div>
      </CardContent>
      {!hideActions && (
        <div className="p-4 border-t space-y-2">
          {isClubProfile ? (
            <AddToClubLibraryDropdown 
              bookId={book.id} 
              isInLibrary={isInClubLibrary} 
            />
          ) : (
            <AddToDiaryDropdown 
              bookId={book.id} 
              isInDiary={isInDiary} 
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default BookCard;