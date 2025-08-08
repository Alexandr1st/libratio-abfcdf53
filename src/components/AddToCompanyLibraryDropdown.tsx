import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Loader2, Building2 } from "lucide-react";
import { useAddBookToCompanyLibrary } from "@/hooks/useCompanyBooks";
import { toast } from "@/hooks/use-toast";

interface AddToCompanyLibraryDropdownProps {
  bookId: string;
  isInLibrary: boolean;
}

const AddToCompanyLibraryDropdown = ({ bookId, isInLibrary }: AddToCompanyLibraryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const addBookToLibrary = useAddBookToCompanyLibrary();

  const handleAddToLibrary = async () => {
    try {
      console.log('Adding book to company library:', { bookId });
      await addBookToLibrary.mutateAsync({ bookId });
      setIsOpen(false);
      toast({
        title: "Успешно",
        description: "Книга добавлена в библиотеку компании",
      });
    } catch (error) {
      console.error('Error adding book to company library:', error);
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
      variant="secondary"
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

export default AddToCompanyLibraryDropdown;