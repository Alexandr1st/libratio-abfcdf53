
import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBookNotesByBook, useCreateBookNote } from "@/hooks/useBookNotes";

interface MyNotesBlockProps {
  bookId: string;
}

const MyNotesBlock = ({ bookId }: MyNotesBlockProps) => {
  const { data: notes, isLoading } = useBookNotesByBook(bookId);
  const createNote = useCreateBookNote();
  const [isAdding, setIsAdding] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const handleSubmit = () => {
    if (!noteContent.trim()) return;
    createNote.mutate(
      { bookId, noteContent: noteContent.trim() },
      {
        onSuccess: () => {
          setNoteContent("");
          setIsAdding(false);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Мои заметки
        </h3>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Textarea
              placeholder="Введите вашу заметку..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNoteContent("");
                }}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={createNote.isPending || !noteContent.trim()}
              >
                Сохранить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка заметок...</p>
      )}

      {!isLoading && notes && notes.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">Заметок пока нет</p>
      )}

      {notes &&
        notes.map((note, index) => (
          <Card key={note.id}>
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Заметка №{notes.length - index}{" "}
                {new Date(note.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {note.note_content}
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default MyNotesBlock;
