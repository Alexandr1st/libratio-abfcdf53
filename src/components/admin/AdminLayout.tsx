import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useAdminRoles';
import { Button } from '@/components/ui/button';
import { Home, Users, Building2, Book, Settings, Activity, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const { data: isAdmin, isLoading } = useIsAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Проверка прав доступа...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Доступ запрещен</h1>
          <p className="text-red-600 mb-6">У вас нет прав для доступа к административной панели.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться на сайт
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Главная', icon: Home },
    { path: '/admin/users', label: 'Пользователи', icon: Users },
    { path: '/admin/clubs', label: 'Клубы', icon: Building2 },
    { path: '/admin/books', label: 'Книги', icon: Book },
    { path: '/admin/activity', label: 'Активность', icon: Activity },
    { path: '/admin/settings', label: 'Настройки', icon: Settings },
  ];

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Админ панель</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          
          <nav className="p-4 space-y-2">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start mb-4 text-gray-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться на сайт
              </Button>
            </Link>
            
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActiveRoute(item.path) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;