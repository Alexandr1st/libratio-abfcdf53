import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Building2, Calendar, Edit, MapPin, Star, Globe, Users, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

const ClubProfile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) { navigate("/auth"); return; }
      fetchClubData();
    }
  }, [user, authLoading, navigate]);

  const fetchClubData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('clubs').select('*').eq('contact_person_id', user.id).single();
      if (error || !data) { navigate("/profile"); return; }
      setClub(data);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить данные клуба", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (authLoading || loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse" /></div>;
  if (!user || !club) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">
                  {club.logo_url ? <img src={club.logo_url} alt="Logo" className="w-24 h-24 rounded-lg mx-auto object-cover"/> : <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center mx-auto"><Building2 className="h-12 w-12 text-blue-600" /></div>}
                </div>
                <CardTitle className="text-2xl">{club.name}</CardTitle>
                <CardDescription className="text-base">Клуб</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {club.description && <div className="text-sm text-gray-600"><p>{club.description}</p></div>}
                {club.location && <div className="flex items-center space-x-2 text-sm text-gray-600"><MapPin className="h-4 w-4" /><span>{club.location}</span></div>}
                {club.website && <div className="flex items-center space-x-2 text-sm text-gray-600"><Globe className="h-4 w-4" /><a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Чат</a></div>}
                <div className="space-y-2 pt-4">
                  <Link to="/club-profile/edit"><Button className="w-full"><Edit className="mr-2 h-4 w-4" />Редактировать профиль</Button></Link>
                  <Button variant="outline" className="w-full" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" />Выйти</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle className="flex items-center justify-between"><span>Библиотека клуба</span><Badge variant="secondary">0 книг</Badge></CardTitle></CardHeader>
              <CardContent><div className="text-center py-8 text-gray-500"><BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>Библиотека клуба пуста</p></div></CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
