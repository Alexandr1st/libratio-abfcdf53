import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

interface Company {
  id: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  website: string | null;
}

interface CompanyFormData {
  description: string;
  industry: string;
  location: string;
  website: string;
  logo_url: string;
}

const EditCompanyProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CompanyFormData>();

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
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, description, industry, location, logo_url, website')
        .eq('contact_person_id', user.id)
        .single();

      if (companyError || !companyData) {
        navigate("/profile");
        return;
      }

      setCompany(companyData);
      
      // Заполняем форму данными компании
      setValue('description', companyData.description || '');
      setValue('industry', companyData.industry || '');
      setValue('location', companyData.location || '');
      setValue('website', companyData.website || '');
      setValue('logo_url', companyData.logo_url || '');

    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные клуба",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!company) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          description: data.description || null,
          industry: data.industry || null,
          location: data.location || null,
          website: data.website || null,
          logo_url: data.logo_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Успешно!",
        description: "Данные клуба обновлены",
      });

      navigate("/company-profile");
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные клуба",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-lg text-gray-600">Загрузка...</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            to="/company-profile" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к профилю
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-6 w-6 mr-2" />
              Редактирование профиля клуба
            </CardTitle>
            <CardDescription>
              Обновите информацию о вашем клубе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry">Отрасль</Label>
                  <Input
                    id="industry"
                    placeholder="Например: IT, Финансы, Образование"
                    {...register('industry')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Местоположение</Label>
                  <Input
                    id="location"
                    placeholder="Город, страна"
                    {...register('location')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Веб-сайт</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...register('website')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL логотипа</Label>
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...register('logo_url')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание клуба</Label>
                <Textarea
                  id="description"
                  placeholder="Расскажите о вашем клубе, его миссии и деятельности"
                  className="min-h-[120px]"
                  {...register('description')}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link to="/company-profile">
                  <Button variant="outline" type="button">
                    Отмена
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить изменения
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCompanyProfile;