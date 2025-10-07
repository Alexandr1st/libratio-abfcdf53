import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, Building2, Plus } from "lucide-react";
import AddUserDialog from "@/components/admin/AddUserDialog";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get admin roles separately
      const userIds = data.map(user => user.id);
      const { data: adminRoles } = await supabase
        .from("admin_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Get company employees data
      const { data: companyEmployees } = await supabase
        .from("company_employees")
        .select(`
          user_id,
          companies (
            id,
            name
          )
        `)
        .in("user_id", userIds);

      // Get companies where user is contact person
      const { data: contactCompanies } = await supabase
        .from("companies")
        .select("contact_person_id, id, name")
        .in("contact_person_id", userIds);

      // Merge the data
      return data.map(user => {
        const employeeCompany = companyEmployees?.find(ce => ce.user_id === user.id)?.companies;
        const contactCompany = contactCompanies?.find(c => c.contact_person_id === user.id);
        
        return {
          ...user,
          companies: employeeCompany || contactCompany || null,
          admin_roles: adminRoles?.filter(role => role.user_id === user.id) || []
        };
      });
    },
  });

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-gray-600">Просмотр и управление пользователями системы</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени, username, должности или компании..."
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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Пользователи ({filteredUsers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers && filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Компания</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Роль админа</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {user.full_name || 'Не указано'}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username || 'нет username'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.companies ? (
                            <>
                              <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                              {user.companies.name}
                            </>
                          ) : (
                            <span className="text-gray-400">Нет компании</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.position || <span className="text-gray-400">Не указано</span>}
                      </TableCell>
                      <TableCell>
                        {user.admin_roles && user.admin_roles.length > 0 ? (
                          <div className="space-y-1">
                            {user.admin_roles.map((adminRole, index) => (
                              <Badge 
                                key={index} 
                                variant={
                                  adminRole.role === 'super_admin' ? 'destructive' :
                                  adminRole.role === 'admin' ? 'default' : 'secondary'
                                }
                              >
                                {adminRole.role === 'super_admin' ? 'Супер админ' :
                                 adminRole.role === 'admin' ? 'Админ' : 'Модератор'}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline">Пользователь</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Не указано'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Редактировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей в системе'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddUserDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </AdminLayout>
  );
};

export default AdminUsers;