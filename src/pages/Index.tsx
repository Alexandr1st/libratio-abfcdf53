import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Star, ArrowRight } from "lucide-react";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Headline */}
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl text-center">
            <span className="block">Добро пожаловать в <span className="text-blue-600">Libratio</span></span>
            <span className="block mt-2">Ваш личный кабинет читателя</span>
          </h1>
          {/* Description */}
          <p className="mt-6 text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Отслеживайте свои прочитанные книги, делитесь впечатлениями и находите новых друзей по интересам.
          </p>
          {/* CTA Buttons */}
          <div className="mt-10 flex justify-center space-x-4">
            <Link to="/books">
              <Button size="lg">
                Каталог книг
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/diary">
              <Button variant="outline" size="lg">
                Мой дневник
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Возможности</h2>
          <p className="mt-4 text-lg text-gray-600 text-center">
            Все, что нужно для удобного чтения и обмена опытом.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Удобный каталог книг</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ищите книги по названию, автору или жанру. Добавляйте в свой список "Хочу прочитать" или отмечайте как "Прочитано".
                </CardDescription>
              </CardContent>
            </Card>
            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Сообщество читателей</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Общайтесь с другими читателями, делитесь своими впечатлениями о книгах и находите новые рекомендации.
                </CardDescription>
              </CardContent>
            </Card>
            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Отслеживание прогресса</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ставьте цели по чтению на год и отслеживайте свой прогресс. Получайте уведомления о новых книгах от ваших любимых авторов.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Наша статистика</h2>
          <p className="mt-4 text-lg text-gray-600 text-center">
            Цифры говорят сами за себя.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600">12,000+</div>
              <div className="mt-2 text-gray-500">Зарегистрированных пользователей</div>
            </div>
            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600">45,000+</div>
              <div className="mt-2 text-gray-500">Книг в каталоге</div>
            </div>
            {/* Stat 3 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600">9,000+</div>
              <div className="mt-2 text-gray-500">Активных обсуждений</div>
            </div>
            {/* Stat 4 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600">4.8</div>
              <div className="mt-2 text-gray-500">Средняя оценка книг <Star className="inline-block h-5 w-5 text-yellow-400 ml-1" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">Присоединяйтесь к нам сегодня!</h2>
          <p className="mt-4 text-xl text-blue-100">
            Начните свой путь в мир книг прямо сейчас.
          </p>
          <Link to="/auth">
            <Button variant="secondary" size="lg" className="mt-8">
              Зарегистрироваться
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
