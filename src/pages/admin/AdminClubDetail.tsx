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

const AdminClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    logo_url: "",
    chat_link: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: club, isLoading } = useQuery({
    queryKey: ["adminClub", id],
    queryFn: async () => {
      // Fetch club data
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select(`
          *,
          profiles!clubs_contact_person_id_fkey(full_name, username)
        `)
        .eq("id", id)
        .maybeSingle();

      if (clubError) {
        console.error("Error fetching club:", clubError);
        throw clubError;
      }

      if (!clubData) return null;

      // Fetch club members with their profiles separately
      const { data: members, error: membersError } = await supabase
        .from("club_members")
        .select("id, user_id, position, joined_at")
        .eq("club_id", id);

      if (membersError) {
        console.error("Error fetching members:", membersError);
      }

      // Fetch profiles for all members
      if (members && members.length > 0) {
        const userIds = members.map(e => e.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, username")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        // Merge profiles with members
        const membersWithProfiles = members.map(member => ({
          ...member,
          profiles: profiles?.find(p => p.id === member.user_id) || null
        }));

        return {
          ...clubData,
          club_members: membersWithProfiles
        };
      }

      return {
        ...clubData,
        club_members: []
      };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || "",
        description: club.description || "",
        location: club.location || "",
        logo_url: club.logo_url || "",
        chat_link: club.website || "",
      });
      setLogoFile(null);
    }
  }, [club]);

  const updateClubMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let logoUrl = data.logo_url;

      if (logoFile && club) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${club.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("club-logos")
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("club-logos").getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("clubs")
        .update({
          name: data.name,
          description: data.description || null,
          location: data.location || null,
          logo_url: logoUrl || null,
          website: data.chat_link || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminClub", id] });
      queryClient.invalidateQueries({ queryKey: ["adminClubs"] });
      toast({
        title: "Клуб обновлен",
        description: "Информация о клубе успешно обновлена",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить клуб: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClubMutation.mutate(formData);
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

  if (!club) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Клуб не найден</p>
          <Button onClick={() => navigate("/admin/clubs")}>
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
              onClick={() => navigate("/admin/clubs")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                {club.logo_url && (
                  <img 
                    src={club.logo_url} 
                    alt={club.name} 
                    className="w-8 h-8 rounded mr-3"
                  />
                )}
                {club.name}
              </h1>
              <p className="text-gray-600">Детали и редактирование клуба</p>
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

                  <div>
                    <Label htmlFor="location">Местоположение</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo">Логотип клуба</Label>
                    {formData.logo_url && (
                      <div className="mb-2">
                        <img
                          src={formData.logo_url}
                          alt={club.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setLogoFile(file);
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="chat_link">Ссылка на чат</Label>
                    <Input
                      id="chat_link"
                      value={formData.chat_link}
                      onChange={(e) => setFormData({ ...formData, chat_link: e.target.value })}
                      placeholder="https://t.me/yourgroup"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/admin/clubs")}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={updateClubMutation.isPending}>
                      {updateClubMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Участники ({club.club_members?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {club.club_members && club.club_members.length > 0 ? (
                  <div className="space-y-3">
                    {club.club_members.map((member: any) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {member.profiles?.full_name || "Без имени"}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{member.profiles?.username || "нет username"}
                          </p>
                          {member.position && (
                            <p className="text-sm text-gray-600 mt-1">{member.position}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Присоединился: {new Date(member.joined_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Нет участников</p>
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
                  <Globe className="mr-3 h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Ссылка на чат</p>
                    {club.website ? (
                      <a
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {club.website}
                      </a>
                    ) : (
                      <p className="text-gray-400">Не указано</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="mr-3 h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Участников</p>
                    <p className="font-medium">{club.club_members?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="mr-3 h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Дата создания</p>
                    <p className="font-medium">
                      {new Date(club.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Person */}
            {club.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle>Контактное лицо</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium">{club.profiles.full_name || "Не указано"}</p>
                    <p className="text-sm text-gray-500">
                      @{club.profiles.username || "нет username"}
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

export default AdminClubDetail;
