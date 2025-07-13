
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface DiaryEmptyStateProps {
  selectedStatus: string;
}

const DiaryEmptyState = ({ selectedStatus }: DiaryEmptyStateProps) => {
  return (
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
  );
};

export default DiaryEmptyState;
