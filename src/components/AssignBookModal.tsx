import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, Plus } from "lucide-react";
import { useClubBooksWithDetails } from "@/hooks/useClubBooks";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface ClubBookWithDetails {
  id: string;
  club_id: string;
  book_id: string;
  added_at: string;
  books: {
    id: string;
    title: string;
    author: string;
    genre: string;
    image: string | null;
    description: string | null;
  };
}

interface AssignBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Member | null;
  companyId: string;
}

const AssignBookModal = ({ isOpen, onClose, employee, companyId }: AssignBookModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { data: clubBooks, isLoading } = useClubBooksWithDetails(companyId);

  const filteredBooks = (clubBooks as ClubBookWithDetails[] | undefined)?.filter((clubBook) =>
    clubBook.books.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clubBook.books.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignBook = async (book: ClubBookWithDetails['books']) => {
    if (!employee) return;

    try {
      // Здесь будет логика назначения книги участнику
      toast({
        title: "Книга назначена",
        description: `Книга "${book.title}" назначена участнику ${employee.profiles?.full_name}`,
      });
      onClose();
    } catch (error) {
      console.error('Error assigning book:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось назначить книгу участнику",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Назначить книгу участнику</DialogTitle>
          <DialogDescription>
            Выберите книгу из библиотеки клуба для {employee?.profiles?.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск книг..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto animate-pulse mb-2" />
              <p className="text-gray-600">Загрузка книг...</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              {filteredBooks && filteredBooks.length > 0 ? (
                <div className="space-y-3">
                  {filteredBooks.map((clubBook) => (
                    <div
                      key={clubBook.id}
                      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        {clubBook.books.image ? (
                          <img
                            src={clubBook.books.image}
                            alt={clubBook.books.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{clubBook.books.title}</h4>
                        <p className="text-sm text-gray-600">{clubBook.books.author}</p>
                        <p className="text-xs text-gray-500">{clubBook.books.genre}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssignBook(clubBook.books)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Назначить
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "Книги не найдены" : "Библиотека пуста"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Попробуйте изменить поисковый запрос"
                      : "Добавьте книги в библиотеку клуба"}
                  </p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignBookModal;
