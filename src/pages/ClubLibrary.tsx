import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, Filter } from "lucide-react";
import BookCard from "@/components/BookCard";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

const ClubLibrary = () => {
  const { user, loading: authLoading } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [clubBooks, setClubBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) { navigate("/auth"); return; }
      fetchClubLibrary();
    }
  }, [user, authLoading, navigate]);

  const fetchClubLibrary = async () => {
    if (!user) return;
    try {
      const { data: clubData, error: clubError } = await supabase.from('clubs').select('id, name').eq('contact_person_id', user.id).single();
      if (clubError || !clubData) { navigate("/profile"); return; }
      setClub(clubData);
      const { data: booksData, error: booksError } = await supabase.from('club_books').select(`id, book_id, added_at, books (*)`).eq('club_id', clubData.id).order('added_at', { ascending: false });
      if (booksError) throw booksError;
      setClubBooks(booksData || []);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить библиотеку клуба", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = clubBooks.filter(item => item.books?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.books?.author?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authLoading || loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse" /></div>;
  if (!user || !club) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">Библиотека клуба {club.name}</h1></div>
        <div className="mb-6"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" /><Input placeholder="Поиск..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Всего книг</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{clubBooks.length}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Жанры</CardTitle><Filter className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Set(clubBooks.map(item => item.books?.genre)).size}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Добавить книги</CardTitle></CardHeader><CardContent><Link to="/books"><Button className="w-full">Перейти к каталогу</Button></Link></CardContent></Card>
        </div>
        {filteredBooks.length === 0 ? (
          <Card><CardContent className="text-center py-12"><BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">{searchTerm ? "Книги не найдены" : "Библиотека пуста"}</h3>{!searchTerm && <Link to="/books"><Button>Перейти к каталогу книг</Button></Link>}</CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredBooks.map((item) => <BookCard key={item.id} book={item.books} isInDiary={false} isCompanyProfile={true} />)}</div>
        )}
      </div>
    </div>
  );
};

export default ClubLibrary;
