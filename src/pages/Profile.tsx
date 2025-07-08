
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Building2, Calendar, Edit, MapPin, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const user = {
    name: "Анна Петрова",
    company: "TechCorp",
    position: "Senior Frontend Developer",
    location: "Москва, Россия",
    joinDate: "Январь 2023",
    avatar: "👩‍💻",
    booksRead: 24,
    reviews: 18,
    followers: 156,
    following: 89
  };

  const currentlyReading = [
    {
      id: 1,
      title: "Microservices Patterns",
      author: "Chris Richardson",
      progress: 65,
      image: "📖"
    },
    {
      id: 2,
      title: "Team Topologies",
      author: "Matthew Skelton",
      progress: 32,
      image: "👥"
    }
  ];

  const recentReviews = [
    {
      id: 1,
      book: "Чистый код",
      author: "Роберт Мартин",
      rating: 5,
      review: "Отличная книга для любого разработчика. Много практических советов по написанию качественного кода.",
      date: "5 дней назад",
      image: "📚"
    },
    {
      id: 2,
      book: "Психология влияния",
      author: "Роберт Чалдини",
      rating: 4,
      review: "Интересные принципы влияния, которые можно применить не только в продажах, но и в повседневной жизни.",
      date: "2 недели назад",
      image: "🧠"
    }
  ];

  const readingGoals = {
    yearly: 30,
    current: 24,
    percentage: 80
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
                <Button variant="outline" className="text-blue-600">Профиль</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{user.avatar}</div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="text-base">
                  {user.position}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>{user.company}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>На платформе с {user.joinDate}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.booksRead}</div>
                    <div className="text-sm text-gray-500">Прочитано</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user.reviews}</div>
                    <div className="text-sm text-gray-500">Отзывов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{user.followers}</div>
                    <div className="text-sm text-gray-500">Подписчиков</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{user.following}</div>
                    <div className="text-sm text-gray-500">Подписки</div>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать профиль
                </Button>
              </CardContent>
            </Card>

            {/* Reading Goals */}
            <Card className="border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Цель на год</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Прогресс</span>
                    <span className="text-sm font-medium">{readingGoals.current}/{readingGoals.yearly} книг</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${readingGoals.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Осталось прочитать {readingGoals.yearly - readingGoals.current} книг до конца года
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Currently Reading */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Читаю сейчас</span>
                  <Link to="/diary">
                    <Button variant="outline" size="sm">
                      Открыть дневник
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentlyReading.map((book) => (
                    <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{book.image}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-2">{book.title}</h4>
                          <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Прогресс</span>
                              <span>{book.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full" 
                                style={{ width: `${book.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Последние отзывы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{review.image}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{review.book}</h4>
                            <p className="text-sm text-gray-500">{review.author}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{review.review}</p>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
