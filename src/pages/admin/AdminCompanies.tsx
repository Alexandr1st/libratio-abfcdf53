import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Users, Globe } from "lucide-react";
import EditCompanyDialog from "@/components/admin/EditCompanyDialog";

const AdminCompanies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies, isLoading } = useQuery({
    queryKey: ["adminCompanies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          profiles!companies_contact_person_id_fkey(full_name, username),
          company_employees(id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredCompanies = companies?.filter(company => 
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Управление компаниями</h1>
          <p className="text-gray-600">Просмотр и управление компаниями в системе</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию, отрасли или местоположению..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Компании ({filteredCompanies?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCompanies && filteredCompanies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Компания</TableHead>
                    <TableHead>Контактное лицо</TableHead>
                    <TableHead>Отрасль</TableHead>
                    <TableHead>Местоположение</TableHead>
                    <TableHead>Сотрудники</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center">
                            {company.logo_url && (
                              <img 
                                src={company.logo_url} 
                                alt={company.name} 
                                className="w-6 h-6 rounded mr-2"
                              />
                            )}
                            {company.name}
                          </div>
                          {company.website && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Globe className="mr-1 h-3 w-3" />
                              <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {company.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.profiles ? (
                          <div>
                            <div className="font-medium">
                              {company.profiles.full_name || 'Не указано'}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{company.profiles.username || 'нет username'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Не назначено</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.industry ? (
                          <Badge variant="outline">{company.industry}</Badge>
                        ) : (
                          <span className="text-gray-400">Не указано</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.location || <span className="text-gray-400">Не указано</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-400" />
                          {company.company_employees?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingCompany(company);
                            setDialogOpen(true);
                          }}
                        >
                          Редактировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Компании не найдены' : 'Нет компаний в системе'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditCompanyDialog
        company={editingCompany}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </AdminLayout>
  );
};

export default AdminCompanies;