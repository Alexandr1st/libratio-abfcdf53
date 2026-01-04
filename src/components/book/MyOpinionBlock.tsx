import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save, Loader2 } from "lucide-react";

interface MyOpinionBlockProps {
  notes: string | null;
  onSave: (notes: string) => void;
  isSaving: boolean;
}

const MyOpinionBlock = ({ notes, onSave, isSaving }: MyOpinionBlockProps) => {
  const [opinion, setOpinion] = useState(notes || "");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setOpinion(notes || "");
    setHasChanges(false);
  }, [notes]);

  const handleChange = (value: string) => {
    setOpinion(value);
    setHasChanges(value !== (notes || ""));
  };

  const handleSave = () => {
    onSave(opinion);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Мое мнение
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Напишите свое мнение о книге..."
          value={opinion}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[150px] resize-y"
        />
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Сохранить
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MyOpinionBlock;
