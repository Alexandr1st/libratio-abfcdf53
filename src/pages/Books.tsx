
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Star, Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  description: string;
  pages: number;
  year: number;
  image: string;
  readByColleagues: number;
}

const mockBooks: Book[] = [
  {
    id: 1,
    title: "Чистый код",
    author: "Роберт Мартин",
    genre: "Программирование",
    rating: 4.8,
    description: "Руководство по написанию качественного программного кода",
    pages: 464,
    year: 2008,
    image: "📚",
    readByColleagues: 45
  },
  {
    id: 2,
    title: "Архитектор ПО на практике",
    author: "Лен Басс",
    genre: "Архитектура ПО",
    rating: 4.6,
    description: "Практическое руководство по архитектуре программного обеспечения",
    pages: 512,
    year: 2012,
    image: "🏗️",
    readByColleagues: 23
  },
  {
    id: 3,
    title: "Психология влияния",
    author: "Роберт Чалдини",
    genre: "Психология",
    rating: 4.9,
    description: "Классическая книга о принципах влияния и убеждения",
    pages: 336,
    year: 2006,
    image: "🧠",
    readByColleagues: 67
  },
  {
    id: 4,
    title: "Lean Startup",
    author: "Эрик Рис",
    genre: "Бизнес",
    rating: 4.7,
    description: "Методология создания успешных стартапов",
    pages: 336,
    year: 2011,
    image: "🚀",
    readByColleagues: 34
  },
  {
    id: 5,
    title: "Дизайн повседневных вещей",
    author: "Дон Норман",
    genre: "Дизайн",
    rating: 4.5,
    description: "Основы пользовательского опыта и дизайна интерфейсов",
    pages: 368,
    year: 2013,
    image: "🎨",
    readByColleagues: 28
  },
  {
    id: 6,
    title: "Сначала скажите НЕТ",
    author: "Джим Кэмп",
    genre: "Переговоры",
    rating: 4.4,
    description: "Система переговоров, основанная на эмоциональном интеллекте",
    pages: 352,
    year: 2002,
    image: "💼",
    readByColleagues: 19
  }
];

const Books = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Все");

  const genres = ["Все", "Программирование", "Бизнес", "Психология", "Дизайн", "Архитектура ПО", "Переговоры"];

  const filteredBooks = mockBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "Все" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

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
                <Button variant="ghost" className="text-blue-600">Каталог книг</Button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Каталог книг</h1>
          <p className="text-lg text-gray-600">Откройте для себя новые книги и узнайте, что читают ваши коллеги</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или автору..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-4">{book.image}</div>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl line-clamp-2">{book.title}</CardTitle>
                <CardDescription className="text-base">
                  <span className="font-medium">{book.author}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  {book.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{book.pages} стр.</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{book.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{book.genre}</Badge>
                    <span className="text-xs text-blue-600">
                      {book.readByColleagues} коллег читают
                    </span>
                  </div>

                  <Button className="w-full" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить в дневник
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">Книги не найдены</h3>
            <p className="text-gray-400">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
