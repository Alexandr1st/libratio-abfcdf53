import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Users, MapPin, Calendar, Book } from "lucide-react";
import { useClubs } from "@/hooks/useClubs";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BookCard from "@/components/BookCard";

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
        .select(`id, added_at, books (*)`)
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

        {/* Club Info */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-3xl font-bold">{club.name}</CardTitle>
                <CardDescription className="text-lg">{club.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {club.location && <div className="flex items-center space-x-2"><MapPin className="h-5 w-5 text-gray-500" /><span>{club.location}</span></div>}
              
              <div className="flex items-center space-x-2"><Calendar className="h-5 w-5 text-gray-500" /><span>Создан {new Date(club.created_at).toLocaleDateString('ru-RU')}</span></div>
              <div className="flex items-center space-x-2"><Users className="h-5 w-5 text-gray-500" /><span>{members?.length || 0} участников</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Club Books */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Book className="h-6 w-6" />
            <span>Книги клуба</span>
          </h2>
          {clubBooks && clubBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubBooks.map((cb: any) => (
                cb.books && <BookCard key={cb.id} book={cb.books} hideActions />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Нет книг в библиотеке клуба</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
