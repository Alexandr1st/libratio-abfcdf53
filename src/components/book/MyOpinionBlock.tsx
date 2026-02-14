import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save, Loader2, Pencil, Plus, Star } from "lucide-react";

interface MyOpinionBlockProps {
  notes: string | null;
  rating: number | null;
  onSave: (notes: string, rating: number) => void;
  isSaving: boolean;
}

const MIN_CHARS = 100;

const MyOpinionBlock = ({ notes, rating, onSave, isSaving }: MyOpinionBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [opinion, setOpinion] = useState(notes || "");
  const [selectedRating, setSelectedRating] = useState(rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    setOpinion(notes || "");
    setSelectedRating(rating || 0);
    setIsEditing(false);
  }, [notes, rating]);

  const handleSave = () => {
    if (opinion.trim().length < MIN_CHARS || selectedRating < 1) return;
    onSave(opinion, selectedRating);
    setIsEditing(false);
  };

  const hasOpinion = !!notes && notes.trim().length > 0 && !!rating;
  const charsLeft = MIN_CHARS - opinion.trim().length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Мое мнение
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              {hasOpinion ? (
                <>
                  <Pencil className="h-4 w-4 mr-1" />
                  Исправить
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {/* Rating selector */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Оценка</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setSelectedRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoveredRating || selectedRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                {selectedRating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">{selectedRating}/5</span>
                )}
              </div>
            </div>

            <div>
              <Textarea
                placeholder="Напишите свое мнение о книге (минимум 100 символов)..."
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                className="min-h-[150px] resize-y"
                autoFocus
              />
              <p className={`text-xs mt-1 ${charsLeft > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {charsLeft > 0
                  ? `Ещё ${charsLeft} символов`
                  : `${opinion.trim().length} символов`}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || opinion.trim().length < MIN_CHARS || selectedRating < 1}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpinion(notes || "");
                  setSelectedRating(rating || 0);
                  setIsEditing(false);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : hasOpinion ? (
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= (rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{notes}</p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">Оставьте свое мнение</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MyOpinionBlock;
