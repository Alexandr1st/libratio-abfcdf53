import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

interface ClubFormData { description: string; location: string; chat_link: string; }

const EditClubProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, setValue } = useForm<ClubFormData>();

  useEffect(() => {
    if (!authLoading) {
      if (!user) { navigate("/auth"); return; }
      fetchClubData();
    }
  }, [user, authLoading, navigate]);

  const fetchClubData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('clubs').select('id, description, location, logo_url, website').eq('contact_person_id', user.id).single();
      if (error || !data) { navigate("/profile"); return; }
      setClub(data);
      setValue('description', data.description || '');
      setValue('location', data.location || '');
      setValue('chat_link', data.website || '');
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить данные клуба", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClubFormData) => {
    if (!club) return;
    setSaving(true);
    try {
      let logoUrl = club.logo_url;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${club.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('club-logos').upload(fileName, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('club-logos').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }
      const { error } = await supabase.from('clubs').update({ description: data.description || null, location: data.location || null, website: data.chat_link || null, logo_url: logoUrl || null, updated_at: new Date().toISOString() }).eq('id', club.id);
      if (error) throw error;
      toast({ title: "Успешно!", description: "Данные клуба обновлены" });
      navigate("/club-profile");
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось обновить данные клуба", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><Building2 className="h-12 w-12 text-blue-600 mx-auto animate-pulse" /></div>;
  if (!user || !club) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6"><Link to="/club-profile" className="inline-flex items-center text-blue-600 hover:text-blue-800"><ArrowLeft className="h-4 w-4 mr-2" />Назад к профилю</Link></div>
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="flex items-center"><Building2 className="h-6 w-6 mr-2" />Редактирование профиля клуба</CardTitle><CardDescription>Обновите информацию о вашем клубе</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2"><Label htmlFor="location">Местоположение</Label><Input id="location" placeholder="Город, страна" {...register('location')} /></div>
              <div className="space-y-2"><Label htmlFor="chat_link">Ссылка на чат</Label><Input id="chat_link" type="url" placeholder="https://t.me/yourgroup" {...register('chat_link')} /></div>
              <div className="space-y-2"><Label htmlFor="logo">Логотип клуба</Label>{club?.logo_url && <div className="mb-2"><img src={club.logo_url} alt="Current logo" className="w-20 h-20 object-cover rounded" /></div>}<Input id="logo" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setLogoFile(file); }} /></div>
              <div className="space-y-2"><Label htmlFor="description">Описание клуба</Label><Textarea id="description" placeholder="Расскажите о вашем клубе" className="min-h-[120px]" {...register('description')} /></div>
              <div className="flex justify-end space-x-4"><Link to="/club-profile"><Button variant="outline" type="button">Отмена</Button></Link><Button type="submit" disabled={saving}>{saving ? "Сохранение..." : <><Save className="h-4 w-4 mr-2" />Сохранить изменения</>}</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditClubProfile;
