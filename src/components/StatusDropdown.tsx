
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2 } from "lucide-react";
import { useUpdateDiaryEntry } from "@/hooks/useDiaryEntries";

interface StatusDropdownProps {
  currentStatus: string;
  entryId: string;
}

const StatusDropdown = ({ currentStatus, entryId }: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateDiaryEntry = useUpdateDiaryEntry();

  const statusOptions = [
    { value: "want_to_read", label: "Хочу читать", variant: "outline" as const },
    { value: "reading", label: "Читаю", variant: "default" as const },
    { value: "paused", label: "Пауза", variant: "outline" as const },
    { value: "completed", label: "Прочел", variant: "secondary" as const },
  ];

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);

  const handleStatusChange = (newStatus: string) => {
    const updates: any = { status: newStatus };
    
    // Автоматически устанавливаем дату завершения при смене статуса на "Прочел"
    if (newStatus === "completed") {
      updates.completed_at = new Date().toISOString();
    } else if (currentStatus === "completed" && newStatus !== "completed") {
      // Убираем дату завершения если статус меняется с "Прочел" на другой
      updates.completed_at = null;
    }

    updateDiaryEntry.mutate({
      id: entryId,
      updates
    });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          <Badge variant={currentStatusOption?.variant}>
            {currentStatusOption?.label}
            {updateDiaryEntry.isPending ? (
              <Loader2 className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <ChevronDown className="ml-1 h-3 w-3" />
            )}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={currentStatus === option.value ? "bg-accent" : ""}
          >
            <Badge variant={option.variant} className="mr-2">
              {option.label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
