
import { useState } from "react";
import { useCompanies, useJoinCompany } from "@/hooks/useCompanies";
import { useCompanyStats } from "@/hooks/useCompanyEmployees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Building2, Search, Users, TrendingUp, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const CompanyStats = ({ companyId }: { companyId: string }) => {
  const { data: stats, isLoading } = useCompanyStats(companyId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Активных читателей</span>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {stats?.activeReaders || 0}
        </Badge>
      </div>

      {stats?.topBooks && stats.topBooks.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Популярные книги</h4>
          <div className="space-y-2">
            {stats.topBooks.slice(0, 3).map((book, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{book?.image || '📚'}</span>
                  <div>
                    <p className="font-medium text-sm">{book?.title}</p>
                    <p className="text-xs text-gray-500">{book?.author}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Популярная
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("Все");

  const { data: companies, isLoading, error } = useCompanies();
  const joinCompany = useJoinCompany();

  // Get unique industries from companies
  const industries = companies 
    ? ["Все", ...new Set(companies.map(company => company.industry).filter(Boolean))]
    : ["Все"];

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "Все" || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  }) || [];

  const handleJoinCompany = (companyId: string) => {
    joinCompany.mutate({ companyId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Libratio</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/books">
                <Button variant="ghost">Каталог книг</Button>
              </Link>
              <Link to="/companies">
                <Button variant="ghost" className="text-blue-600">Компании</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">Профиль</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Каталог компаний</h1>
          <p className="text-lg text-gray-600">Узнайте, что читают в разных компаниях и найдите единомышленников</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию компании..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <Badge
                key={industry}
                variant={selectedIndustry === industry ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => setSelectedIndustry(industry)}
              >
                {industry}
              </Badge>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Загрузка компаний...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-600 mb-2">Ошибка загрузки</h3>
            <p className="text-red-400">Не удалось загрузить список компаний</p>
          </div>
        )}

        {/* Companies Grid */}
        {!isLoading && !error && (
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">🏢</div>
                      <div>
                        <CardTitle className="text-xl">{company.name}</CardTitle>
                        <CardDescription className="text-base mb-2">
                          {company.industry || "Не указано"}
                        </CardDescription>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{company.location || "Не указано"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {company.description && (
                      <p className="text-gray-600">{company.description}</p>
                    )}
                    
                    <CompanyStats companyId={company.id} />

                    <Button 
                      className="w-full" 
                      onClick={() => handleJoinCompany(company.id)}
                      disabled={joinCompany.isPending}
                    >
                      {joinCompany.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Присоединение...
                        </>
                      ) : (
                        "Присоединиться к сообществу"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">Компании не найдены</h3>
            <p className="text-gray-400">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
