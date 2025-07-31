import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";

interface ProfileData {
  full_name: string | null;
  bio: string | null;
  location: string | null;
  company_id: string | null;
}

const EditProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    bio: "",
    location: "",
    company_id: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();

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
        .select('full_name, bio, location, company_id')
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

      setProfileData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        location: data.location || "",
        company_id: data.company_id || null
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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
          location: profileData.location || null,
          company_id: profileData.company_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить изменения",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Успешно",
        description: "Профиль обновлен",
      });

      navigate("/profile");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-lg text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Введите ваше полное имя"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Расскажите о себе"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Местоположение</Label>
                <Input
                  id="location"
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Город, страна"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Место работы</Label>
                <Select
                  value={profileData.company_id || undefined}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, company_id: value || null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите компанию или оставьте пустым" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
