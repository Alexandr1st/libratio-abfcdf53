
import { useState } from "react";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import AddBookNoteModal from "@/components/AddBookNoteModal";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import DiaryHeader from "@/components/diary/DiaryHeader";
import DiaryFilters from "@/components/diary/DiaryFilters";
import BookCard from "@/components/BookCard";
import DiaryEmptyState from "@/components/diary/DiaryEmptyState";
import DiaryLoadingState from "@/components/diary/DiaryLoadingState";
import DiaryErrorState from "@/components/diary/DiaryErrorState";

const Diary = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedBookForNote, setSelectedBookForNote] = useState<{
    id: string;
    title: string;
    diaryEntryId: string;
  } | null>(null);

  const { data: diaryEntries, isLoading, error } = useDiaryEntries();

  const filteredEntries = selectedStatus === "all" 
    ? diaryEntries || []
    : (diaryEntries || []).filter(entry => entry.status === selectedStatus);

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
      <DiaryNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DiaryHeader />
        
        <DiaryFilters 
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {isLoading && <DiaryLoadingState />}

        {error && !isLoading && <DiaryErrorState />}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry: any) => (
              <BookCard 
                key={entry.id}
                book={entry.books}
                hideActions
              />
            ))}
          </div>
        )}

        {!isLoading && !error && filteredEntries.length === 0 && (
          <DiaryEmptyState selectedStatus={selectedStatus} />
        )}
      </div>

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
