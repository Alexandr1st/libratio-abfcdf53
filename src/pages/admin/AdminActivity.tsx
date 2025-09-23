import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, Search, Calendar, User, Book } from "lucide-react";

const AdminActivity = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["adminActivities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_entries")
        .select(`
          id,
          created_at,
          updated_at,
          status,
          rating,
          pages_read,
          user_id,
          books(title, author, genre)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user profiles separately
      const userIds = data.map(entry => entry.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, company_id")
        .in("id", userIds);

      // Merge the data
      return data.map(entry => ({
        ...entry,
        profiles: profiles?.find(p => p.id === entry.user_id) || null
      }));
    },
  });

  const filteredActivities = activities?.filter(activity => 
    activity.books?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.books?.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reading':
        return <Badge variant="default">Читает</Badge>;
      case 'completed':
        return <Badge variant="secondary">Завершено</Badge>;
      case 'planned':
        return <Badge variant="outline">Запланировано</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Активность пользователей</h1>
          <p className="text-gray-600">Мониторинг активности чтения и взаимодействия с книгами</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по книге, автору или пользователю..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Последняя активность ({filteredActivities?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredActivities && filteredActivities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Книга</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Прогресс</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Последнее обновление</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {activity.profiles?.full_name || 'Не указано'}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{activity.profiles?.username || 'нет username'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Book className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{activity.books?.title}</div>
                            <div className="text-sm text-gray-500">
                              {activity.books?.author}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {activity.books?.genre}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(activity.status)}
                      </TableCell>
                      <TableCell>
                        {activity.pages_read ? (
                          <div className="text-sm">
                            {activity.pages_read} стр.
                          </div>
                        ) : (
                          <span className="text-gray-400">Не указано</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.rating ? (
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1">{activity.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Нет оценки</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(activity.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.updated_at !== activity.created_at ? (
                          <div className="text-sm text-gray-500">
                            {new Date(activity.updated_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Активность не найдена' : 'Нет активности в системе'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminActivity;