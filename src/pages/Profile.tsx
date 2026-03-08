import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Building2, Calendar, Edit, TrendingUp, User, LogOut, Target } from "lucide-react";
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
import { useCurrentlyReading } from "@/hooks/useCurrentlyReading";
import { useBookNotesByBook } from "@/hooks/useBookNotes";
import { useQuery } from "@tanstack/react-query";

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
  const updateGoal = useUpdateReadingGoal();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const { data: currentlyReading, isLoading: readingLoading } = useCurrentlyReading();

  const { data: recentNotes, isLoading: notesLoading } = useQuery({
    queryKey: ["recent-notes"],
    queryFn: async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return [];
      const { data, error } = await supabase
        .from("book_notes")
        .select("*, books(*)")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
  });

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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Цель на год</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGoalInput(profileStats?.yearlyReadingGoal?.toString() || "");
                    setGoalDialogOpen(true);
                  }}
                >
                  <Target className="h-4 w-4 mr-1" />
                  {profileStats?.yearlyReadingGoal ? "Изменить" : "Указать"}
                </Button>
              </CardHeader>
              <CardContent>
                {profileStats?.yearlyReadingGoal ? (() => {
                  const current = profileStats.booksReadThisYear;
                  const goal = profileStats.yearlyReadingGoal;
                  const percentage = Math.min(Math.round((current / goal) * 100), 100);
                  const remaining = Math.max(goal - current, 0);
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Прогресс</span>
                        <span className="text-sm font-medium">
                          {current}/{goal} {pluralize(goal, "книга", "книги", "книг").split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {remaining > 0
                          ? `Осталось прочитать ${pluralize(remaining, "книгу", "книги", "книг")} до конца года`
                          : "Цель достигнута! 🎉"}
                      </p>
                    </div>
                  );
                })() : (
                  <p className="text-sm text-muted-foreground">
                    Укажите, сколько книг вы хотите прочитать в этом году
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Goal Dialog */}
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Цель на год</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Сколько книг вы хотите прочитать в этом году?</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    placeholder="Например, 12"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button
                    onClick={() => {
                      const val = parseInt(goalInput);
                      if (val > 0) {
                        updateGoal.mutate(val, { onSuccess: () => setGoalDialogOpen(false) });
                      }
                    }}
                    disabled={!goalInput || parseInt(goalInput) <= 0 || updateGoal.isPending}
                  >
                    Сохранить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                {readingLoading ? (
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                ) : !currentlyReading || currentlyReading.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет книг со статусом «Читаю»</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentlyReading.map((entry) => {
                      const book = entry.books as any;
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
                                    <div
                                      className="bg-primary h-1 rounded-full"
                                      style={{ width: `${progress}%` }}
                                    />
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

            {/* Recent Notes */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Последние заметки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {notesLoading ? (
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                ) : !recentNotes || recentNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">У вас пока нет заметок</p>
                ) : (
                  recentNotes.map((note: any) => {
                    const book = note.books;
                    const date = new Date(note.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    });
                    return (
                      <div key={note.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          {book?.image ? (
                            <img src={book.image} alt={book.title} className="w-10 h-14 object-cover rounded" />
                          ) : (
                            <div className="text-3xl">📝</div>
                          )}
                          <div className="flex-1">
                            <Link to={`/books/${book?.id}`}>
                              <h4 className="font-semibold hover:underline">{book?.title || "Книга"}</h4>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-1">{book?.author}</p>
                            <p className="text-sm text-foreground mb-2 line-clamp-3">{note.note_content}</p>
                            <p className="text-xs text-muted-foreground">{date}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;