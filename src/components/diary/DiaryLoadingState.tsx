
import { Loader2 } from "lucide-react";

const DiaryLoadingState = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2 text-lg text-gray-600">Загрузка дневника...</span>
    </div>
  );
};

export default DiaryLoadingState;
