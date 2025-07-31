
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Edit3, Star, Loader2, FileText, Quote } from "lucide-react";
import StatusDropdown from "@/components/StatusDropdown";
import BookNotesList from "@/components/BookNotesList";
import { useUpdateDiaryEntry } from "@/hooks/useDiaryEntries";

interface DiaryEntryProps {
  entry: any;
  onAddNote: (entry: any) => void;
}

const DiaryEntry = ({ entry, onAddNote }: DiaryEntryProps) => {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editRating, setEditRating] = useState<number | null>(null);
  
  const updateDiaryEntry = useUpdateDiaryEntry();

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry.id);
    setEditNotes(entry.notes || "");
    setEditRating(entry.rating);
  };

  const handleSaveEdit = () => {
    if (editingEntry) {
      updateDiaryEntry.mutate({
        id: editingEntry,
        updates: {
          notes: editNotes,
          rating: editRating
        }
      });
      setEditingEntry(null);
      setEditNotes("");
      setEditRating(null);
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">{entry.books?.image || '📚'}</div>
            <div>
              <CardTitle className="text-xl">{entry.books?.title}</CardTitle>
              <CardDescription className="text-base mb-2">
                {entry.books?.author}
              </CardDescription>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(entry.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                {entry.pages_read && entry.pages_read > 0 && (
                  <span>стр. {entry.pages_read}</span>
                )}
                <StatusDropdown 
                  currentStatus={entry.status} 
                  entryId={entry.id}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {entry.rating && (
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < entry.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
            {entry.status === 'reading' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAddNote(entry)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Добавить заметку
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleEditEntry(entry)}
            >
              {entry.rating ? "Изменить отзыв" : "Оставить отзыв"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {editingEntry === entry.id ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Заметки</label>
                <Textarea 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ваши мысли о книге..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Оценка</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          editRating && star <= editRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingEntry(null)}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={updateDiaryEntry.isPending}
                >
                  {updateDiaryEntry.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Сохранить
                </Button>
              </div>
            </div>
          ) : (
            <>
              {entry.notes && (
                <p className="text-gray-700 leading-relaxed">{entry.notes}</p>
              )}
              
              {entry.quotes && entry.quotes.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2">
                    <Quote className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Цитаты</h4>
                      {entry.quotes.map((quote: string, index: number) => (
                        <blockquote key={index} className="text-blue-800 italic">
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <BookNotesList diaryEntryId={entry.id} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiaryEntry;
