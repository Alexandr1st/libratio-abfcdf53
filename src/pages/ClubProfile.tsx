import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Building2, Edit, MapPin, Globe, Users, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useClubMembers } from "@/hooks/useClubMembers";
import { useQuery } from "@tanstack/react-query";

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

  const { data: members = [], isLoading: membersLoading } = useClubMembers(club?.id);

  const { data: clubBooks = [] } = useQuery({
    queryKey: ['club-books', club?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_books')
        .select('*, books(*)')
        .eq('club_id', club.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!club?.id,
  });

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
            {/* Библиотека клуба */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Библиотека клуба
                  </span>
                  <Badge variant="secondary">{clubBooks.length} книг</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clubBooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Библиотека клуба пуста</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {clubBooks.slice(0, 6).map((item: any) => (
                      <div key={item.id} className="text-center">
                        <img 
                          src={item.books?.image || '/placeholder.svg'} 
                          alt={item.books?.title}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <p className="text-sm font-medium truncate">{item.books?.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.books?.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Участники клуба */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Участники клуба
                  </span>
                  <Badge variant="secondary">{members.length} участников</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full" />
                          <div className="h-4 bg-gray-200 rounded w-32" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>В клубе пока нет участников</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {member.profiles?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.profiles?.full_name || 'Без имени'}</p>
                            {member.position && (
                              <p className="text-sm text-gray-500">{member.position}</p>
                            )}
                          </div>
                        </div>
                        {member.is_admin && (
                          <Badge variant="outline" className="text-xs">Админ</Badge>
                        )}
                      </div>
                    ))}
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

export default ClubProfile;
