
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, MapPin, Globe, Plus } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";
import { CreateCompanyDialog } from "@/components/CreateCompanyDialog";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

const Companies = () => {
  const [open, setOpen] = useState(false);
  const { data: companies, isLoading, isError } = useCompanies();
  const { toast } = useToast();

  const handleCreateCompany = () => {
    setOpen(true);
  };

  if (isLoading) {
    return <div>Loading companies...</div>;
  }

  if (isError) {
    toast({
      title: "Ошибка",
      description: "Не удалось загрузить компании",
      variant: "destructive",
    });
    return <div>Error loading companies.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Компании</h1>
          <Button onClick={handleCreateCompany}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить компанию
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies?.map((company) => (
            <Card key={company.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <Link to={`/companies/${company.id}`} className="block">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{company.name}</CardTitle>
                  <CardDescription>{company.industry}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Сотрудники</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Globe className="h-4 w-4" />
                      <span className="text-blue-500">Веб-сайт</span>
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <CreateCompanyDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Companies;
