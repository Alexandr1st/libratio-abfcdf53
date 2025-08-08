import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Search, Filter, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

interface CompanyBook {
  id: string;
  book_id: string;
  added_at: string;
  books: {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string | null;
    image: string | null;
    rating: number | null;
    pages: number | null;
    year: number | null;
  };
}

interface Company {
  id: string;
  name: string;
}

const CompanyLibrary = () => {
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyBooks, setCompanyBooks] = useState<CompanyBook[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchCompanyLibrary();
    }
  }, [user, authLoading, navigate]);

  const fetchCompanyLibrary = async () => {
    if (!user) return;

    try {
      // Проверяем, является ли пользователь контактным лицом компании
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('contact_person_id', user.id)
        .single();

      if (companyError || !companyData) {
        // Пользователь не является контактным лицом компании
        navigate("/profile");
        return;
      }

      setCompany(companyData);

      // Получаем книги компании
      const { data: booksData, error: booksError } = await supabase
        .from('company_books')
        .select(`
          id,
          book_id,
          added_at,
          books (
            id,
            title,
            author,
            genre,
            description,
            image,
            rating,
            pages,
            year
          )
        `)
        .eq('company_id', companyData.id)
        .order('added_at', { ascending: false });

      if (booksError) {
        throw booksError;
      }

      setCompanyBooks(booksData || []);
    } catch (error) {
      console.error('Error fetching company library:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить библиотеку компании",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = companyBooks.filter(item =>
    item.books.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.books.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.books.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-lg text-gray-600">Загрузка библиотеки...</p>
        </div>
      </div>
    );
  }

  if (!user || !company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Библиотека компании {company.name}
          </h1>
          <p className="text-gray-600">
            Книги, добавленные в корпоративную библиотеку
          </p>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по названию, автору или жанру..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего книг</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyBooks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Жанры</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(companyBooks.map(item => item.books.genre)).size}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Добавить книги</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link to="/books">
                <Button className="w-full">
                  Перейти к каталогу
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Список книг */}
        {filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Книги не найдены" : "Библиотека пуста"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? "Попробуйте изменить поисковый запрос"
                  : "Добавьте книги в корпоративную библиотеку из каталога"
                }
              </p>
              {!searchTerm && (
                <Link to="/books">
                  <Button>
                    Перейти к каталогу книг
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      {item.books.image ? (
                        <img
                          src={item.books.image}
                          alt={item.books.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.books.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.books.author}
                      </p>
                      <Badge variant="secondary" className="mb-2">
                        {item.books.genre}
                      </Badge>
                      
                      {item.books.rating && (
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {item.books.rating}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Добавлена {new Date(item.added_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyLibrary;