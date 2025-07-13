
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, Edit3, Plus, Quote, Star, Loader2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useDiaryEntries, useUpdateDiaryEntry } from "@/hooks/useDiaryEntries";
import StatusDropdown from "@/components/StatusDropdown";
import AddBookNoteModal from "@/components/AddBookNoteModal";
import BookNotesList from "@/components/BookNotesList";

const Diary = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editRating, setEditRating] = useState<number | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedBookForNote, setSelectedBookForNote] = useState<{
    id: string;
    title: string;
    diaryEntryId: string;
  } | null>(null);

  const { data: diaryEntries, isLoading, error } = useDiaryEntries();
  const updateDiaryEntry = useUpdateDiaryEntry();

  const statusLabels = {
    all: "Все записи",
    reading: "Читаю",
    completed: "Прочел",
    paused: "Пауза",
    want_to_read: "Хочу читать"
  };

  const filteredEntries = selectedStatus === "all" 
    ? diaryEntries || []
    : (diaryEntries || []).filter(entry => entry.status === selectedStatus);

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

  const handleAddNoteClick = (entry: any) => {
    setSelectedBookForNote({
      id: entry.book_id,
      title: entry.books?.title || '',
      diaryEntryId: entry.id,
    });
    setNoteModalOpen(true);
  };

  const handleCloseNoteModal = () => {
    setNoteModalOpen(false);
    setSelectedBookForNote(null);
  };

  if (error) {
    console.error('Error loading diary entries:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Libratio</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/books">
                <Button variant="ghost">Каталог книг</Button>
              </Link>
              <Link to="/diary">
                <Button variant="ghost" className="text-blue-600 bg-blue-50">Мой дневник</Button>
              </Link>
              <Link to="/companies">
                <Button variant="ghost">Компании</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">Профиль</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Мой читательский дневник</h1>
            <p className="text-lg text-gray-600">Ваши мысли и впечатления о прочитанных книгах</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={selectedStatus === key ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => setSelectedStatus(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Загрузка дневника...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-600 mb-2">Ошибка загрузки</h3>
            <p className="text-red-400">Не удалось загрузить записи дневника</p>
          </div>
        )}

        {/* Diary Entries */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {filteredEntries.map((entry: any) => (
              <Card key={entry.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                          onClick={() => handleAddNoteClick(entry)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Добавить заметку
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Edit3 className="h-4 w-4" />
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

                        {/* Book Notes List */}
                        <BookNotesList diaryEntryId={entry.id} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">Записей не найдено</h3>
            <p className="text-gray-400 mb-4">
              {selectedStatus === 'all' 
                ? 'Начните добавлять книги из каталога в свой дневник'
                : 'В этой категории пока нет записей'
              }
            </p>
            <Link to="/books">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Перейти к каталогу книг
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Add Book Note Modal */}
      {selectedBookForNote && (
        <AddBookNoteModal
          isOpen={noteModalOpen}
          onClose={handleCloseNoteModal}
          bookTitle={selectedBookForNote.title}
          bookId={selectedBookForNote.id}
          diaryEntryId={selectedBookForNote.diaryEntryId}
        />
      )}
    </div>
  );
};

export default Diary;
