
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Loader2 } from "lucide-react";
import { useAddBookToDiary } from "@/hooks/useDiaryEntries";
import { toast } from "@/hooks/use-toast";

interface AddToDiaryDropdownProps {
  bookId: string;
  isInDiary: boolean;
}

const AddToDiaryDropdown = ({ bookId, isInDiary }: AddToDiaryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const addBookToDiary = useAddBookToDiary();

  const statusOptions = [
    { value: "want_to_read", label: "Хочу читать" },
    { value: "reading", label: "Читаю" },
    { value: "paused", label: "Пауза" },
    { value: "completed", label: "Прочел" },
  ];

  const handleAddToDiary = async (status: string) => {
    try {
      console.log('Adding book to diary:', { bookId, status });
      await addBookToDiary.mutateAsync({
        bookId,
        status
      });
      setIsOpen(false);
      toast({
        title: "Успешно",
        description: "Книга добавлена в дневник",
      });
    } catch (error) {
      console.error('Error adding book to diary:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить книгу в дневник",
        variant: "destructive",
      });
    }
  };

  if (isInDiary) {
    return (
      <Button disabled variant="outline" size="sm">
        В дневнике
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={addBookToDiary.isPending}>
          {addBookToDiary.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Добавить в дневник
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleAddToDiary(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToDiaryDropdown;
