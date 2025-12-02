import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Users, Globe, Plus } from "lucide-react";
import CreateClubDialog from "@/components/CreateClubDialog";

const AdminClubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: clubs, isLoading } = useQuery({
    queryKey: ["adminClubs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select(`
          *,
          profiles!clubs_contact_person_id_fkey(full_name, username),
          club_members(id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredClubs = clubs?.filter(club => 
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление клубами</h1>
          <p className="text-gray-600">Просмотр и управление клубами в системе</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию или местоположению..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clubs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Клубы ({filteredClubs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClubs && filteredClubs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Клуб</TableHead>
                    <TableHead>Контактное лицо</TableHead>
                    <TableHead>Местоположение</TableHead>
                    <TableHead>Участники</TableHead>
                    <TableHead>Дата создания</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link 
                            to={`/admin/clubs/${club.id}`}
                            className="font-medium flex items-center hover:text-blue-600 transition-colors"
                          >
                            {club.logo_url && (
                              <img 
                                src={club.logo_url} 
                                alt={club.name} 
                                className="w-6 h-6 rounded mr-2"
                              />
                            )}
                            {club.name}
                          </Link>
                          {club.website && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Globe className="mr-1 h-3 w-3" />
                              <a href={club.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {club.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {club.profiles ? (
                          <div>
                            <div className="font-medium">
                              {club.profiles.full_name || 'Не указано'}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{club.profiles.username || 'нет username'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Не назначено</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {club.location || <span className="text-gray-400">Не указано</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-400" />
                          {club.club_members?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(club.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Клубы не найдены' : 'Нет клубов в системе'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateClubDialog
        open={addDialogOpen}
        setOpen={setAddDialogOpen}
      />
    </AdminLayout>
  );
};

export default AdminClubs;
