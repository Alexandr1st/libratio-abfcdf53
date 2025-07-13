import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, Clock } from "lucide-react";
import AddToDiaryDropdown from "@/components/AddToDiaryDropdown";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

const Books = () => {
  const [mockBooks, setMockBooks] = useState([
    {
      id: 1,
      title: "Война и мир",
      author: "Лев Толстой",
      rating: 4,
      genre: "Роман",
      status: "В процессе чтения",
      timeStarted: "2023-01-15",
      timeFinished: null,
      image: "https://upload.wikimedia.org/wikipedia/ru/thumb/9/91/%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8_%D0%92%D0%BE%D0%B9%D0%BD%D0%B0_%D0%B8_%D0%BC%D0%B8%D1%80_1%D0%B8%D0%B9_%D1%82%D0%BE%D0%BC.jpg/330px-%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8_%D0%92%D0%BE%D0%B9%D0%BD%D0%B0_%D0%B8_%D0%BC%D0%B8%D1%80_1%D0%B8%D0%B9_%D1%82%D0%BE%D0%BC.jpg",
    },
    {
      id: 2,
      title: "Преступление и наказание",
      author: "Федор Достоевский",
      rating: 5,
      genre: "Роман",
      status: "Прочитано",
      timeStarted: "2022-11-01",
      timeFinished: "2022-12-20",
      image: "https://upload.wikimedia.org/wikipedia/ru/thumb/4/4a/%D0%9F%D1%80%D0%B5%D1%81%D1%82%D1%83%D0%BF%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B8_%D0%BD%D0%B0%D0%BA%D0%B0%D0%B7%D0%B0%D0%BD%D0%B8%D0%B5.jpg/375px-%D0%9F%D1%80%D0%B5%D1%81%D1%82%D1%83%D0%BF%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B8_%D0%BD%D0%B0%D0%BA%D0%B0%D0%B7%D0%B0%D0%BD%D0%B8%D0%B5.jpg",
    },
    {
      id: 3,
      title: "Мастер и Маргарита",
      author: "Михаил Булгаков",
      rating: 4,
      genre: "Роман",
      status: "Запланировано",
      timeStarted: null,
      timeFinished: null,
      image: "https://upload.wikimedia.org/wikipedia/ru/thumb/3/3c/%D0%9C%D0%B0%D1%81%D1%82%D0%B5%D1%80_%D0%B8_%D0%9C%D0%B0%D1%80%D0%B3%D0%B0%D1%80%D0%B8%D1%82%D0%B0_%28%D0%B8%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5_1967%29.jpg/276px-%D0%9C%D0%B0%D1%81%D1%82%D0%B5%D1%80_%D0%B8_%D0%9C%D0%B0%D1%80%D0%B3%D0%B0%D1%80%D0%B8%D1%82%D0%B0_%28%D0%B8%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5_1967%29.jpg",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBooks.map((book) => (
            <Card key={book.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="flex items-center space-x-4 p-4">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-16 h-24 object-cover rounded-md"
                />
                <div>
                  <CardTitle className="text-lg font-semibold">{book.title}</CardTitle>
                  <CardDescription className="text-gray-500">{book.author}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Badge variant="secondary">{book.genre}</Badge>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{book.status}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Рейтинг:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < book.rating ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t">
                <AddToDiaryDropdown book={book} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Books;
