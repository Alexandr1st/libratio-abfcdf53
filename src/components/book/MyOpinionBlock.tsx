import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save, Loader2, Pencil, Plus } from "lucide-react";

interface MyOpinionBlockProps {
  notes: string | null;
  onSave: (notes: string) => void;
  isSaving: boolean;
}

const MyOpinionBlock = ({ notes, onSave, isSaving }: MyOpinionBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [opinion, setOpinion] = useState(notes || "");

  useEffect(() => {
    setOpinion(notes || "");
    setIsEditing(false);
  }, [notes]);

  const handleSave = () => {
    onSave(opinion);
    setIsEditing(false);
  };

  const hasOpinion = !!notes && notes.trim().length > 0;

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
            <Textarea
              placeholder="Напишите свое мнение о книге..."
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              className="min-h-[150px] resize-y"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving} size="sm">
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
                  setIsEditing(false);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : hasOpinion ? (
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{notes}</p>
        ) : (
          <p className="text-muted-foreground italic">Оставьте свое мнение</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MyOpinionBlock;
