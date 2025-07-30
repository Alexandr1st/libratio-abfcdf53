import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, MapPin, Globe, Calendar, Book } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyEmployees } from "@/hooks/useCompanyEmployees";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: companies, isLoading } = useCompanies();
  
  // Получаем сотрудников компании
  const { data: employees } = useQuery({
    queryKey: ['company-employees', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('company_employees')
        .select('*')
        .eq('company_id', id)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching company employees:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!id,
  });
  
  const company = companies?.find(c => c.id === id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DiaryNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Компания не найдена</h1>
            <Link to="/companies">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к компаниям
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/companies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к компаниям
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-3xl font-bold">{company.name}</CardTitle>
                    <CardDescription className="text-lg">{company.industry}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {company.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">О компании</h3>
                    <p className="text-gray-600">{company.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-gray-500" />
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
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>Создана {new Date(company.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span>{employees?.length || 0} сотрудников</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Employees */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Сотрудники</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employees && employees.length > 0 ? (
                  <div className="space-y-3">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Сотрудник</p>
                          {employee.position && (
                            <p className="text-sm text-gray-500">{employee.position}</p>
                          )}
                        </div>
                        {employee.is_admin && (
                          <Badge variant="secondary">Админ</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Нет сотрудников</p>
                )}
              </CardContent>
            </Card>

            {/* Company Books */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Книги компании</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Скоро здесь будут отображаться книги компании</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;