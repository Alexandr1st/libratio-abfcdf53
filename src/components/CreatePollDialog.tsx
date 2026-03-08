import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export interface PollDates {
  votingStartsAt: Date;
  votingEndsAt: Date;
  readingStartsAt: Date;
  readingEndsAt: Date;
}

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dates: PollDates) => void;
  isPending?: boolean;
  /** Pass initial dates to enable edit mode */
  initialDates?: Partial<PollDates>;
  mode?: "create" | "edit";
}

const CreatePollDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  initialDates,
  mode = "create",
}: CreatePollDialogProps) => {
  const [votingStartsAt, setVotingStartsAt] = useState<Date>();
  const [votingEndsAt, setVotingEndsAt] = useState<Date>();
  const [readingStartsAt, setReadingStartsAt] = useState<Date>();
  const [readingEndsAt, setReadingEndsAt] = useState<Date>();

  useEffect(() => {
    if (open && initialDates) {
      setVotingStartsAt(initialDates.votingStartsAt);
      setVotingEndsAt(initialDates.votingEndsAt);
      setReadingStartsAt(initialDates.readingStartsAt);
      setReadingEndsAt(initialDates.readingEndsAt);
    } else if (open && !initialDates) {
      setVotingStartsAt(undefined);
      setVotingEndsAt(undefined);
      setReadingStartsAt(undefined);
      setReadingEndsAt(undefined);
    }
  }, [open, initialDates]);

  const isValid = votingStartsAt && votingEndsAt && readingStartsAt && readingEndsAt
    && votingEndsAt > votingStartsAt
    && readingStartsAt >= votingEndsAt
    && readingEndsAt > readingStartsAt;

  const handleSubmit = () => {
    if (votingStartsAt && votingEndsAt && readingStartsAt && readingEndsAt) {
      onSubmit({ votingStartsAt, votingEndsAt, readingStartsAt, readingEndsAt });
    }
  };

  const DatePickerField = ({
    label,
    date,
    onSelect,
    minDate,
  }: {
    label: string;
    date: Date | undefined;
    onSelect: (d: Date | undefined) => void;
    minDate?: Date;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            disabled={(d) => (minDate ? d < minDate : d < new Date(new Date().setHours(0, 0, 0, 0)))}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Редактировать голосование" : "Создать голосование"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Голосование</p>
            <DatePickerField
              label="Начало голосования"
              date={votingStartsAt}
              onSelect={setVotingStartsAt}
            />
            <DatePickerField
              label="Конец голосования"
              date={votingEndsAt}
              onSelect={setVotingEndsAt}
              minDate={votingStartsAt}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Чтение книги</p>
            <DatePickerField
              label="Начало чтения"
              date={readingStartsAt}
              onSelect={setReadingStartsAt}
              minDate={votingEndsAt}
            />
            <DatePickerField
              label="Конец чтения"
              date={readingEndsAt}
              onSelect={setReadingEndsAt}
              minDate={readingStartsAt}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!isValid || isPending} className="w-full">
            {mode === "edit" ? "Сохранить" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;
