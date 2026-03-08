import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface SuggestBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggest: (bookId: string) => void;
  isPending?: boolean;
}

const SuggestBookModal = ({ open, onOpenChange, onSuggest, isPending }: SuggestBookModalProps) => {
  const { user } = useAuth();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const { data: userBooks = [], isLoading } = useQuery({
    queryKey: ["user-diary-books", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("book_id, books(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      // Deduplicate by book_id
      const seen = new Set<string>();
      return (data || []).filter((entry: any) => {
        if (seen.has(entry.book_id)) return false;
        seen.add(entry.book_id);
        return true;
      });
    },
    enabled: open && !!user,
  });

  const handleSuggest = () => {
    if (selectedBookId) {
      onSuggest(selectedBookId);
      setSelectedBookId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Предложить книгу для голосования</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Загрузка...</div>
          ) : userBooks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>У вас нет книг в дневнике</p>
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {userBooks.map((entry: any) => {
                const book = entry.books;
                if (!book) return null;
                const isSelected = selectedBookId === book.id;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => setSelectedBookId(isSelected ? null : book.id)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-colors flex items-center gap-3",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <img
                      src={book.image || "/placeholder.svg"}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {selectedBookId && (
          <Button
            onClick={handleSuggest}
            disabled={isPending}
            className="w-full mt-2"
          >
            Предложить
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuggestBookModal;
