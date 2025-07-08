
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, Edit3, Plus, Quote, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface DiaryEntry {
  id: number;
  bookTitle: string;
  bookAuthor: string;
  bookImage: string;
  date: string;
  pages: string;
  entry: string;
  quotes: string[];
  rating?: number;
  status: "reading" | "completed" | "paused";
}

const mockEntries: DiaryEntry[] = [
  {
    id: 1,
    bookTitle: "Чистый код",
    bookAuthor: "Роберт Мартин",
    bookImage: "📚",
    date: "2024-01-15",
    pages: "стр. 120-150",
    entry: "Сегодня изучал принципы именования переменных. Особенно запомнился совет о том, что имя должно отвечать на вопросы: почему оно существует, что делает и как используется. Буду применять эти правила в своих проектах.",
    quotes: [
      "Чистый код прост и элегантен. Чистый код читается как хорошо написанная проза."
    ],
    status: "reading"
  },
  {
    id: 2,
    bookTitle: "Психология влияния",
    bookAuthor: "Роберт Чалдини",
    bookImage: "🧠",
    date: "2024-01-10",
    pages: "Глава 3",
    entry: "Изучал принцип приверженности и последовательности. Интересно, как люди стремятся быть последовательными со своими прошлыми решениями. Это можно использовать в работе с клиентами и командой.",
    quotes: [
      "Как только мы сделаем выбор или займем определенную позицию, мы столкнемся с личным и межличностным давлением, побуждающим нас вести себя в соответствии с этим обязательством."
    ],
    rating: 5,
    status: "completed"
  },
  {
    id: 3,
    bookTitle: "Microservices Patterns",
    bookAuthor: "Chris Richardson",
    bookImage: "📖",
    date: "2024-01-12",
    pages: "стр. 45-80",
    entry: "Разбирал паттерны декомпозиции монолитных приложений. Особенно интересен подход Domain-Driven Design для выделения границ сервисов. Планирую применить это к нашему текущему проекту.",
    quotes: [],
    status: "reading"
  }
];

const Diary = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  const statusLabels = {
    all: "Все записи",
    reading: "Читаю",
    completed: "Завершено",
    paused: "Приостановлено"
  };

  const filteredEntries = selectedStatus === "all" 
    ? mockEntries 
    : mockEntries.filter(entry => entry.status === selectedStatus);

  const getStatusBadge = (status: string) => {
    const variants = {
      reading: "default",
      completed: "secondary",
      paused: "outline"
    };
    const labels = {
      reading: "Читаю",
      completed: "Завершено",
      paused: "Пауза"
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ReadConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/books">
                <Button variant="ghost">Каталог книг</Button>
              </Link>
              <Link to="/companies">
                <Button variant="ghost">Компании</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">Профиль</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Мой читательский дневник</h1>
            <p className="text-lg text-gray-600">Ваши мысли и впечатления о прочитанных книгах</p>
          </div>
          <Button onClick={() => setIsAddingEntry(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Новая запись
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={selectedStatus === key ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => setSelectedStatus(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Entry Form */}
        {isAddingEntry && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Новая запись в дневнике</CardTitle>
              <CardDescription>Поделитесь своими мыслями о книге</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Название книги</label>
                  <input 
                    className="w-full p-2 border rounded-md" 
                    placeholder="Введите название книги"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Автор</label>
                  <input 
                    className="w-full p-2 border rounded-md" 
                    placeholder="Введите автора"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Страницы/Главы</label>
                <input 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Например: стр. 50-75 или Глава 3"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ваши мысли</label>
                <Textarea 
                  placeholder="Что вы думаете о прочитанном? Какие идеи показались интересными?"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                  Отмена
                </Button>
                <Button onClick={() => setIsAddingEntry(false)}>
                  Сохранить запись
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diary Entries */}
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{entry.bookImage}</div>
                    <div>
                      <CardTitle className="text-xl">{entry.bookTitle}</CardTitle>
                      <CardDescription className="text-base mb-2">
                        {entry.bookAuthor}
                      </CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(entry.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <span>{entry.pages}</span>
                        {getStatusBadge(entry.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.rating && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < entry.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="ghost">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{entry.entry}</p>
                  
                  {entry.quotes.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex items-start space-x-2">
                        <Quote className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">Цитаты</h4>
                          {entry.quotes.map((quote, index) => (
                            <blockquote key={index} className="text-blue-800 italic">
                              "{quote}"
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">Записей не найдено</h3>
            <p className="text-gray-400 mb-4">Начните вести дневник прямо сейчас</p>
            <Button onClick={() => setIsAddingEntry(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первую запись
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
