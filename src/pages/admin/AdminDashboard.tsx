import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Book, BookOpen } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [usersCount, companiesCount, booksCount, diaryEntriesCount] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("diary_entries").select("id", { count: "exact", head: true }),
      ]);

      return {
        users: usersCount.count || 0,
        companies: companiesCount.count || 0,
        books: booksCount.count || 0,
        diaryEntries: diaryEntriesCount.count || 0,
      };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["recentDiaryEntries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_entries")
        .select(`
          id,
          created_at,
          status,
          user_id,
          books(title, author)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get user profiles separately
      const userIds = data.map(entry => entry.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", userIds);

      // Merge the data
      return data.map(entry => ({
        ...entry,
        profiles: profiles?.find(p => p.id === entry.user_id) || null
      }));
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Пользователи",
      value: stats?.users || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Компании",
      value: stats?.companies || 0,
      icon: Building2,
      color: "text-green-600",
    },
    {
      title: "Книги",
      value: stats?.books || 0,
      icon: Book,
      color: "text-orange-600",
    },
    {
      title: "Записи в дневниках",
      value: stats?.diaryEntries || 0,
      icon: BookOpen,
      color: "text-purple-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-600">Обзор системы и основная статистика</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((entry) => (
                  <div key={entry.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {entry.profiles?.full_name || entry.profiles?.username || 'Пользователь'} 
                        {' '}добавил книгу "{entry.books?.title}" в дневник
                      </p>
                      <p className="text-xs text-gray-500">
                        Статус: {entry.status === 'reading' ? 'Читает' : entry.status === 'completed' ? 'Прочитано' : 'В планах'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Нет данных о недавней активности</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;