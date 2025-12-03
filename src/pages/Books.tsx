import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import BookCard from "@/components/BookCard";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useBooks } from "@/hooks/useBooks";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Books = () => {
  const { user } = useAuth();
  const { data: books, isLoading, error } = useBooks();
  const { data: diaryEntries } = useDiaryEntries();
  const [isClubProfile, setIsClubProfile] = useState(false);

  useEffect(() => {
    const checkClubProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('clubs')
          .select('id')
          .eq('contact_person_id', user.id)
          .maybeSingle();
        
        setIsClubProfile(!!data);
      }
    };
    
    checkClubProfile();
  }, [user]);

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
              <BookCard 
                key={book.id}
                book={book}
                isInDiary={diaryEntries?.some(entry => entry.book_id === book.id) || false}
                isClubProfile={isClubProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;