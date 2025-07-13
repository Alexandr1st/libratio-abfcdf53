
import { FileText, Calendar } from "lucide-react";
import { useBookNotes } from "@/hooks/useBookNotes";
import { Card, CardContent } from "@/components/ui/card";

interface BookNotesListProps {
  diaryEntryId: string;
}

const BookNotesList = ({ diaryEntryId }: BookNotesListProps) => {
  const { data: notes, isLoading } = useBookNotes(diaryEntryId);

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">
        Загрузка заметок...
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Заметок пока нет
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Заметки ({notes.length})
      </h4>
      <div className="space-y-2">
        {notes.map((note) => (
          <Card key={note.id} className="border-l-4 border-l-blue-400">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between mb-2">
                {note.page_number && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    стр. {note.page_number}
                  </span>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(note.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {note.note_content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookNotesList;
