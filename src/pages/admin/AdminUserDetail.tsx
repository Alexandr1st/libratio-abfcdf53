import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User, Building2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    position: "",
    bio: "",
    location: "",
    company_id: "",
  });

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["adminUser", id],
    queryFn: async () => {
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user:", userError);
        throw userError;
      }

      if (!userData) return null;

      // Fetch admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", id);

      if (rolesError) {
        console.error("Error fetching admin roles:", rolesError);
      }

      // Fetch company info
      let companyData = null;
      if (userData.company_id) {
        const { data: company } = await supabase
          .from("companies")
          .select("id, name")
          .eq("id", userData.company_id)
          .single();
        companyData = company;
      }

      return {
        ...userData,
        admin_roles: adminRoles || [],
        companies: companyData
      };
    },
    enabled: !!id,
  });

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        username: user.username || "",
        position: user.position || "",
        bio: user.bio || "",
        location: user.location || "",
        company_id: user.company_id || "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          username: data.username,
          position: data.position,
          bio: data.bio,
          location: data.location,
          company_id: data.company_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUser", id] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Пользователь успешно обновлен");
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Ошибка при обновлении пользователя");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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

  if (error || !user) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Пользователь не найден</p>
            <Button onClick={() => navigate("/admin/users")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к списку
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/users")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.full_name || "Без имени"}
              </h1>
              <p className="text-gray-600">@{user.username || "нет username"}</p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Информация о пользователе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Полное имя</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Местоположение</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Биография</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Company Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Компания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="company">Выберите компанию</Label>
              <Select
                value={formData.company_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, company_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без компании</SelectItem>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Admin Roles Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Роли администратора
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.admin_roles && user.admin_roles.length > 0 ? (
              <div className="flex gap-2">
                {user.admin_roles.map((adminRole, index) => (
                  <Badge
                    key={index}
                    variant={
                      adminRole.role === "super_admin"
                        ? "destructive"
                        : adminRole.role === "admin"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {adminRole.role === "super_admin"
                      ? "Супер админ"
                      : adminRole.role === "admin"
                      ? "Админ"
                      : "Модератор"}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge variant="outline">Пользователь</Badge>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Метаданные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Дата регистрации:</span>
              <span className="font-medium">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("ru-RU")
                  : "Не указано"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Последнее обновление:</span>
              <span className="font-medium">
                {user.updated_at
                  ? new Date(user.updated_at).toLocaleDateString("ru-RU")
                  : "Не указано"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
