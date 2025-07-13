
interface DiaryHeaderProps {}

const DiaryHeader = ({}: DiaryHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Мой читательский дневник</h1>
        <p className="text-lg text-gray-600">Ваши мысли и впечатления о прочитанных книгах</p>
      </div>
    </div>
  );
};

export default DiaryHeader;
