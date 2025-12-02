import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, MapPin, Globe, Calendar, Book } from "lucide-react";
import { useClubs } from "@/hooks/useClubs";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: clubs, isLoading } = useClubs();
  
  const { data: members } = useQuery({
    queryKey: ['club-profiles', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, created_at')
        .eq('club_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: clubBooks } = useQuery({
    queryKey: ['club-books', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('club_books')
        .select(`id, added_at, books (id, title, author, genre, image, rating, pages)`)
        .eq('club_id', id)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });
  
  const club = clubs?.find(c => c.id === id);

  if (isLoading) return <div>Loading...</div>;

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DiaryNavigation />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Клуб не найден</h1>
          <Link to="/clubs"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Вернуться к клубам</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/clubs"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Назад к клубам</Button></Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-3xl font-bold">{club.name}</CardTitle>
                    <CardDescription className="text-lg">{club.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {club.location && <div className="flex items-center space-x-2"><MapPin className="h-5 w-5 text-gray-500" /><span>{club.location}</span></div>}
                  {club.website && <div className="flex items-center space-x-2"><Globe className="h-5 w-5 text-gray-500" /><a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Чат</a></div>}
                  <div className="flex items-center space-x-2"><Calendar className="h-5 w-5 text-gray-500" /><span>Создан {new Date(club.created_at).toLocaleDateString('ru-RU')}</span></div>
                  <div className="flex items-center space-x-2"><Users className="h-5 w-5 text-gray-500" /><span>{members?.length || 0} участников</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle className="flex items-center space-x-2"><Users className="h-5 w-5" /><span>Участники</span></CardTitle></CardHeader>
              <CardContent>
                {members && members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <p className="font-medium">{member.full_name || member.username || 'Пользователь'}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500">Нет участников</p>}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader><CardTitle className="flex items-center space-x-2"><Book className="h-5 w-5" /><span>Книги клуба</span></CardTitle></CardHeader>
              <CardContent>
                {clubBooks && clubBooks.length > 0 ? (
                  <div className="space-y-3">
                    {clubBooks.map((cb: any) => (
                      <div key={cb.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{cb.books?.title}</h4>
                          <p className="text-xs text-gray-500">{cb.books?.author}</p>
                          <Badge variant="outline" className="text-xs">{cb.books?.genre}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500">Нет книг в библиотеке клуба</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
