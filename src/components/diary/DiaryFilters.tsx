
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DiaryFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const DiaryFilters = ({ selectedStatus, onStatusChange }: DiaryFiltersProps) => {
  const statusLabels = {
    all: "Все записи",
    reading: "Читаю",
    completed: "Прочел",
    paused: "Пауза",
    want_to_read: "Хочу читать"
  };

  return (
    <Card className="border-0 shadow-sm mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusLabels).map(([key, label]) => (
            <Badge
              key={key}
              variant={selectedStatus === key ? "default" : "outline"}
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => onStatusChange(key)}
            >
              {label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiaryFilters;
