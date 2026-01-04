import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Quote, Plus, Trash2, Loader2 } from "lucide-react";

interface QuoteItem {
  text: string;
  page?: number;
}

interface MyQuotesBlockProps {
  quotes: string[] | null;
  onSave: (quotes: string[]) => void;
  isSaving: boolean;
}

const parseQuote = (quoteStr: string): QuoteItem => {
  try {
    const parsed = JSON.parse(quoteStr);
    return { text: parsed.text || "", page: parsed.page };
  } catch {
    return { text: quoteStr, page: undefined };
  }
};

const stringifyQuote = (quote: QuoteItem): string => {
  return JSON.stringify({ text: quote.text, page: quote.page });
};

const MyQuotesBlock = ({ quotes, onSave, isSaving }: MyQuotesBlockProps) => {
  const [quotesList, setQuotesList] = useState<QuoteItem[]>(
    quotes?.map(parseQuote) || []
  );
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuotePage, setNewQuotePage] = useState("");

  const handleAddQuote = () => {
    if (!newQuoteText.trim()) return;

    const newQuote: QuoteItem = {
      text: newQuoteText.trim(),
      page: newQuotePage ? parseInt(newQuotePage) : undefined,
    };

    const updatedQuotes = [...quotesList, newQuote];
    setQuotesList(updatedQuotes);
    onSave(updatedQuotes.map(stringifyQuote));
    setNewQuoteText("");
    setNewQuotePage("");
  };

  const handleDeleteQuote = (index: number) => {
    const updatedQuotes = quotesList.filter((_, i) => i !== index);
    setQuotesList(updatedQuotes);
    onSave(updatedQuotes.map(stringifyQuote));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Quote className="h-5 w-5" />
          Мои цитаты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing quotes */}
        {quotesList.length > 0 && (
          <div className="space-y-3">
            {quotesList.map((quote, index) => (
              <div
                key={index}
                className="p-3 bg-muted rounded-lg relative group"
              >
                <p className="text-sm italic pr-8">"{quote.text}"</p>
                {quote.page && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Страница {quote.page}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteQuote(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new quote */}
        <div className="space-y-3 pt-2 border-t">
          <Textarea
            placeholder="Введите цитату..."
            value={newQuoteText}
            onChange={(e) => setNewQuoteText(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Номер страницы"
              value={newQuotePage}
              onChange={(e) => setNewQuotePage(e.target.value)}
              className="w-40"
            />
            <Button
              onClick={handleAddQuote}
              disabled={!newQuoteText.trim() || isSaving}
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Добавить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyQuotesBlock;
