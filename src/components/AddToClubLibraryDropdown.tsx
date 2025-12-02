import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Building2 } from "lucide-react";
import { useAddBookToClubLibrary } from "@/hooks/useClubBooks";
import { toast } from "@/hooks/use-toast";

interface AddToClubLibraryDropdownProps {
  bookId: string;
  isInLibrary: boolean;
}

const AddToClubLibraryDropdown = ({ bookId, isInLibrary }: AddToClubLibraryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const addBookToLibrary = useAddBookToClubLibrary();

  const handleAddToLibrary = async () => {
    try {
      console.log('Adding book to club library:', { bookId });
      await addBookToLibrary.mutateAsync({ bookId });
      setIsOpen(false);
      toast({
        title: "Успешно",
        description: "Книга добавлена в библиотеку клуба",
      });
    } catch (error) {
      console.error('Error adding book to club library:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить книгу в библиотеку",
        variant: "destructive",
      });
    }
  };

  if (isInLibrary) {
    return (
      <Button disabled variant="outline" size="sm">
        <Building2 className="mr-2 h-4 w-4" />
        В библиотеке
      </Button>
    );
  }

  return (
    <Button 
      size="sm" 
      disabled={addBookToLibrary.isPending}
      onClick={handleAddToLibrary}
    >
      {addBookToLibrary.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      Добавить в библиотеку
    </Button>
  );
};

export default AddToClubLibraryDropdown;
