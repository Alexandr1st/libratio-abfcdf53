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

interface Company {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  contact_person_id: string | null;
}

interface ContactPerson {
  id: string;
  full_name: string | null;
  position: string | null;
  avatar_url: string | null;
}

const CompanyProfile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [contactPerson, setContactPerson] = useState<ContactPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchCompanyData();
    }
  }, [user, authLoading, navigate]);

  const fetchCompanyData = async () => {
    if (!user) return;

    try {
      // Fetch company where user is contact person
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('contact_person_id', user.id)
        .single();

      if (companyError || !companyData) {
        // User is not a company contact person, redirect to regular profile
        navigate("/profile");
        return;
      }

      setCompany(companyData);

      // Fetch contact person details
      const { data: contactData, error: contactError } = await supabase
        .from('profiles')
        .select('id, full_name, position, avatar_url')
        .eq('id', companyData.contact_person_id)
        .single();

      if (!contactError && contactData) {
        setContactPerson(contactData);
      }

    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные компании",
        variant: "destructive",
      });
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
          <p className="text-lg text-gray-600">Загрузка профиля компании...</p>
        </div>
      </div>
    );
  }

  if (!user || !company) {
    return null;
  }

  const foundedDate = company.created_at 
    ? new Date(company.created_at).toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Неизвестно';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt="Company Logo" 
                      className="w-24 h-24 rounded-lg mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                      <Building2 className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {company.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {company.industry || "Компания"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.description && (
                  <div className="text-sm text-gray-600">
                    <p>{company.description}</p>
                  </div>
                )}
                {company.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Веб-сайт
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>На платформе с {foundedDate}</span>
                </div>
                
                {/* Contact Person */}
                {contactPerson && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Контактное лицо</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {contactPerson.avatar_url ? (
                          <img 
                            src={contactPerson.avatar_url} 
                            alt="Contact Person" 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{contactPerson.full_name}</p>
                        <p className="text-xs text-gray-500">{contactPerson.position || "Представитель"}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4">
                  <Link to="/company-profile/edit">
                    <Button className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать профиль
                    </Button>
                  </Link>
                  
                  <Link to="/books">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Моя библиотека
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Library Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Библиотека компании</span>
                  <Badge variant="secondary">
                    0 книг
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Библиотека компании пуста</p>
                  <p className="text-sm">Добавьте книги в корпоративную библиотеку</p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Books in Company */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Популярные книги</CardTitle>
                <CardDescription>
                  Книги, которые чаще всего читают в вашей компании
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Пока нет популярных книг</p>
                  <p className="text-sm">Статистика появится после добавления книг сотрудниками</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;