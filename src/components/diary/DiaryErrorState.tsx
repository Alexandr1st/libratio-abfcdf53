
import { BookOpen } from "lucide-react";

const DiaryErrorState = () => {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-16 w-16 text-red-300 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-red-600 mb-2">Ошибка загрузки</h3>
      <p className="text-red-400">Не удалось загрузить записи дневника</p>
    </div>
  );
};

export default DiaryErrorState;
