import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, Users, Globe, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminCompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    logo_url: "",
    website: "",
  });

  const { data: company, isLoading, error } = useQuery({
    queryKey: ["adminCompany", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          profiles!companies_contact_person_id_fkey(full_name, username),
          company_employees(id, user_id, position, joined_at, profiles(full_name, username))
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching company:", error);
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        description: company.description || "",
        industry: company.industry || "",
        location: company.location || "",
        logo_url: company.logo_url || "",
        website: company.website || "",
      });
    }
  }, [company]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("companies")
        .update({
          name: data.name,
          description: data.description || null,
          industry: data.industry || null,
          location: data.location || null,
          logo_url: data.logo_url || null,
          website: data.website || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCompany", id] });
      queryClient.invalidateQueries({ queryKey: ["adminCompanies"] });
      toast({
        title: "Компания обновлена",
        description: "Информация о компании успешно обновлена",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить компанию: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!company) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Компания не найдена</p>
          <Button onClick={() => navigate("/admin/companies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к списку
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/companies")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                {company.logo_url && (
                  <img 
                    src={company.logo_url} 
                    alt={company.name} 
                    className="w-8 h-8 rounded mr-3"
                  />
                )}
                {company.name}
              </h1>
              <p className="text-gray-600">Детали и редактирование компании</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Отрасль</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Местоположение</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="logo_url">URL логотипа</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Веб-сайт</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/admin/companies")}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={updateCompanyMutation.isPending}>
                      {updateCompanyMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Employees List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Сотрудники ({company.company_employees?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.company_employees && company.company_employees.length > 0 ? (
                  <div className="space-y-3">
                    {company.company_employees.map((employee: any) => (
                      <div 
                        key={employee.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {employee.profiles?.full_name || "Без имени"}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{employee.profiles?.username || "нет username"}
                          </p>
                          {employee.position && (
                            <p className="text-sm text-gray-600 mt-1">{employee.position}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Присоединился: {new Date(employee.joined_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Нет сотрудников</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Building2 className="mr-3 h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Отрасль</p>
                    {company.industry ? (
                      <Badge variant="outline">{company.industry}</Badge>
                    ) : (
                      <p className="text-gray-400">Не указано</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Globe className="mr-3 h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Веб-сайт</p>
                    {company.website ? (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      <p className="text-gray-400">Не указано</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="mr-3 h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Сотрудников</p>
                    <p className="font-medium">{company.company_employees?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="mr-3 h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Дата создания</p>
                    <p className="font-medium">
                      {new Date(company.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Person */}
            {company.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle>Контактное лицо</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium">{company.profiles.full_name || "Не указано"}</p>
                    <p className="text-sm text-gray-500">
                      @{company.profiles.username || "нет username"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCompanyDetail;
