
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

  const handleAddToDiary = (status: string) => {
    addBookToDiary.mutate({
      bookId,
      status
    });
    setIsOpen(false);
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
