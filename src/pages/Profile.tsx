import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Building2, Calendar, Edit, Star, TrendingUp, User, LogOut, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useProfileStats, useUpdateReadingGoal } from "@/hooks/useProfileStats";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { pluralize } from "@/lib/pluralize";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  club_name: string | null;
  created_at: string | null;
  club_id: string | null;
}

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profileStats, isLoading: statsLoading } = useProfileStats();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, club_name, created_at, club_id')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить профиль",
          variant: "destructive",
        });
        return;
      }

      // If user has a club, fetch the actual club name from clubs table
      if (data.club_id) {
        const { data: clubData } = await supabase
          .from('clubs')
          .select('name')
          .eq('id', data.club_id)
          .single();
        if (clubData) {
          data.club_name = clubData.name;
        }
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-lg text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const joinDate = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Неизвестно';

  // Mock data for now - will be replaced with real data later
  const mockData = {
    booksRead: 24,
    reviews: 18,
    currentlyReading: [
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
    ],
    recentReviews: [
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
    ],
    readingGoals: {
      yearly: 30,
      current: 24,
      percentage: 80
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {profile.full_name || user.email}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <div className="text-sm text-gray-600">
                    <p>{profile.bio}</p>
                  </div>
                )}
                {profile.club_name && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{profile.club_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>На платформе с {joinDate}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {statsLoading ? "..." : profileStats?.booksRead || 0}
                    </div>
                    <div className="text-sm text-gray-500">Прочитано</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {statsLoading ? "..." : profileStats?.reviews || 0}
                    </div>
                    <div className="text-sm text-gray-500">Мнений</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link to="/profile/edit">
                    <Button className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать профиль
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                </div>
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
                    <span className="text-sm font-medium">{mockData.readingGoals.current}/{mockData.readingGoals.yearly} книг</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${mockData.readingGoals.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Осталось прочитать {mockData.readingGoals.yearly - mockData.readingGoals.current} книг до конца года
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
                  {mockData.currentlyReading.map((book) => (
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
                <CardTitle>Последние мнения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockData.recentReviews.map((review) => (
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