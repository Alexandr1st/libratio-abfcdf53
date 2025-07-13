
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCreateBookNote } from "@/hooks/useBookNotes";

interface AddBookNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookId: string;
  diaryEntryId: string;
}

const AddBookNoteModal = ({
  isOpen,
  onClose,
  bookTitle,
  bookId,
  diaryEntryId,
}: AddBookNoteModalProps) => {
  const [pageNumber, setPageNumber] = useState("");
  const [noteContent, setNoteContent] = useState("");
  
  const createBookNote = useCreateBookNote();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noteContent.trim()) {
      return;
    }

    createBookNote.mutate({
      bookId,
      diaryEntryId,
      pageNumber: pageNumber ? parseInt(pageNumber) : undefined,
      noteContent: noteContent.trim(),
    }, {
      onSuccess: () => {
        setPageNumber("");
        setNoteContent("");
        onClose();
      }
    });
  };

  const handleClose = () => {
    setPageNumber("");
    setNoteContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить заметку</DialogTitle>
          <DialogDescription>
            Добавьте заметку к книге "{bookTitle}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="page-number">Номер страницы (необязательно)</Label>
              <Input
                id="page-number"
                type="number"
                placeholder="Введите номер страницы"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                min="1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-content">Заметка</Label>
              <Textarea
                id="note-content"
                placeholder="Введите вашу заметку..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={createBookNote.isPending || !noteContent.trim()}>
              {createBookNote.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookNoteModal;
