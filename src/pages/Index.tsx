import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Building2, PenTool, Search, Star, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-lg text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Libratio</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/books">
                <Button variant="ghost">Каталог книг</Button>
              </Link>
              <Link to="/companies">
                <Button variant="ghost">Компании</Button>
              </Link>
              {user ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost">
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline">Войти</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {user ? `Добро пожаловать, ${user.user_metadata?.full_name || user.email}!` : "Ваш персональный"}
            <span className="text-blue-600 block">читательский дневник</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {user 
              ? "Продолжайте вести дневник чтения, делитесь впечатлениями с коллегами и открывайте новые книги"
              : "Ведите дневник чтения, делитесь впечатлениями с коллегами и откройте для себя новые книги через профессиональные сообщества"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/books">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2 h-5 w-5" />
                Исследовать книги
              </Button>
            </Link>
            {user ? (
              <Link to="/diary">
                <Button size="lg" variant="outline">
                  <PenTool className="mr-2 h-5 w-5" />
                  Мой дневник
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  <PenTool className="mr-2 h-5 w-5" />
                  Создать дневник
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/70">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Возможности платформы
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Читательский дневник</CardTitle>
                <CardDescription>
                  Ведите записи о прочитанных книгах, сохраняйте цитаты и делитесь впечатлениями
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={user ? "/diary" : "/auth"}>
                  <Button variant="link" className="p-0">
                    {user ? "Открыть дневник" : "Начать вести дневник"} →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Building2 className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Рабочие сообщества</CardTitle>
                <CardDescription>
                  Узнайте, что читают ваши коллеги, и откройте для себя профессиональную литературу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/companies">
                  <Button variant="link" className="p-0">
                    Посмотреть компании →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Каталог книг</CardTitle>
                <CardDescription>
                  Обширная библиотека с рекомендациями, рейтингами и отзывами читателей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/books">
                  <Button variant="link" className="p-0">
                    Исследовать каталог →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
              <div className="text-gray-600">Книг в каталоге</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">150+</div>
              <div className="text-gray-600">Компаний</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">1,200+</div>
              <div className="text-gray-600">Пользователей</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">8,900+</div>
              <div className="text-gray-600">Записей в дневниках</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">Libratio</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Libratio. Объединяем читателей через профессиональные сообщества.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
