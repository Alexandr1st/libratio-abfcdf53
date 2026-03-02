import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Save, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ProfileData {
  full_name: string | null;
  bio: string | null;
  club_id: string | null;
  club_name: string | null;
}

const EditProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    bio: "",
    club_id: null,
    club_name: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leavingClub, setLeavingClub] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        .select('full_name, bio, club_id, club_name')
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

      // Always fetch club name from clubs table for accuracy
      let clubName = data.club_name;
      if (data.club_id) {
        const { data: club } = await supabase
          .from('clubs')
          .select('name')
          .eq('id', data.club_id)
          .single();
        clubName = club?.name || data.club_name;
      }

      setProfileData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        club_id: data.club_id || null,
        club_name: clubName || null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!user) return;
    setLeavingClub(true);
    try {
      // Remove from club_members
      if (profileData.club_id) {
        await supabase
          .from('club_members')
          .delete()
          .eq('user_id', user.id)
          .eq('club_id', profileData.club_id);
      }

      // Clear club from profile
      const { error } = await supabase
        .from('profiles')
        .update({ club_id: null, club_name: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setProfileData(prev => ({ ...prev, club_id: null, club_name: null }));
      toast({ title: "Успешно", description: "Вы вышли из клуба" });
    } catch (error) {
      console.error('Error leaving club:', error);
      toast({ title: "Ошибка", description: "Не удалось выйти из клуба", variant: "destructive" });
    } finally {
      setLeavingClub(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name || null,
          bio: profileData.bio || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast({ title: "Ошибка", description: "Не удалось сохранить изменения", variant: "destructive" });
        return;
      }

      toast({ title: "Успешно", description: "Профиль обновлен" });
      navigate("/profile");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Ошибка", description: "Произошла ошибка при сохранении", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-primary mx-auto animate-pulse mb-4" />
          <p className="text-lg text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DiaryNavigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Редактирование профиля</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Полное имя</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={profileData.full_name || ""}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Введите ваше полное имя"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio || ""}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Расскажите о себе"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Клуб</Label>
                {profileData.club_id ? (
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{profileData.club_name || "Клуб"}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={leavingClub}>
                          <LogOut className="h-4 w-4 mr-1" />
                          Выйти
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Выйти из клуба?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите покинуть клуб «{profileData.club_name}»? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLeaveClub} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Выйти
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">Вы не состоите в клубе</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Сохранение..." : "Сохранить изменения"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/profile")}
                  className="flex-1"
                >
                  Отменить
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
