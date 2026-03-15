import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Building2, Calendar, MessageCircle, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to own profile if viewing self
  const isOwnProfile = user?.id === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio, club_id, created_at")
        .eq("id", id!)
        .single();
      if (error) throw error;

      let club_name: string | null = null;
      if (data.club_id) {
        const { data: clubData } = await supabase
          .from("clubs")
          .select("name")
          .eq("id", data.club_id)
          .single();
        club_name = clubData?.name || null;
      }

      return { ...data, club_name };
    },
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: ["user-profile-stats", id],
    queryFn: async () => {
      const { count: booksRead } = await supabase
        .from("diary_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id!)
        .eq("status", "completed");

      const { count: reviews } = await supabase
        .from("diary_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id!)
        .not("rating", "is", null);

      return { booksRead: booksRead || 0, reviews: reviews || 0 };
    },
    enabled: !!id,
  });

  const { data: currentlyReading } = useQuery({
    queryKey: ["user-currently-reading", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*, books(*)")
        .eq("user_id", id!)
        .eq("status", "reading");
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
      </div>
    );
  }

  if (isOwnProfile) {
    navigate("/profile", { replace: true });
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DiaryNavigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Пользователь не найден</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    );
  }

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("ru-RU", { year: "numeric", month: "long" })
    : "Неизвестно";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mb-4">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full mx-auto object-cover" />
                  ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">{profile.full_name || "Без имени"}</CardTitle>
                {profile.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <div className="text-sm text-muted-foreground">
                    <p>{profile.bio}</p>
                  </div>
                )}
                {profile.club_name && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{profile.club_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>На платформе с {joinDate}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats?.booksRead || 0}</div>
                    <div className="text-sm text-muted-foreground">Прочитано</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats?.reviews || 0}</div>
                    <div className="text-sm text-muted-foreground">Мнений</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Currently Reading */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Читает сейчас</CardTitle>
              </CardHeader>
              <CardContent>
                {!currentlyReading || currentlyReading.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет книг со статусом «Читаю»</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentlyReading.map((entry: any) => {
                      const book = entry.books;
                      const progress = book?.pages && entry.pages_read
                        ? Math.round((entry.pages_read / book.pages) * 100)
                        : 0;
                      return (
                        <Link
                          key={entry.id}
                          to={`/books/${book?.id}`}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-3">
                            {book?.image ? (
                              <img src={book.image} alt={book.title} className="w-10 h-14 object-cover rounded" />
                            ) : (
                              <div className="text-2xl">📖</div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm line-clamp-2">{book?.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{book?.author}</p>
                              {book?.pages ? (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span>Прогресс</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1">
                                    <div className="bg-primary h-1 rounded-full" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">{entry.pages_read || 0} стр. прочитано</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
