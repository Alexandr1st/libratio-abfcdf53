import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAdminRoles";

const DiaryNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isClubProfile, setIsClubProfile] = useState(false);
  const { data: isAdmin } = useIsAdmin();
  
  useEffect(() => {
    const checkClubProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('clubs')
          .select('id')
          .eq('contact_person_id', user.id)
          .single();
        
        setIsClubProfile(!!data);
      }
    };
    
    checkClubProfile();
  }, [user]);
  
  const getButtonStyle = (path: string) => {
    return location.pathname === path 
      ? "text-blue-600 bg-blue-50" 
      : "";
  };
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Libratio</span>
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isClubProfile && (
                  <Link to="/club-members">
                    <Button variant="ghost" className={getButtonStyle("/club-members")}>
                      Мои участники
                    </Button>
                  </Link>
                )}
                <Link to="/books">
                  <Button variant="ghost" className={getButtonStyle("/books")}>
                    Каталог книг
                  </Button>
                </Link>
                {isClubProfile && (
                  <Link to="/club-library">
                    <Button variant="ghost" className={getButtonStyle("/club-library")}>
                      Библиотека клуба
                    </Button>
                  </Link>
                )}
                <Link to="/diary">
                  <Button variant="ghost" className={getButtonStyle("/diary")}>Мой дневник</Button>
                </Link>
                <Link to="/clubs">
                  <Button variant="ghost" className={getButtonStyle("/clubs")}>Клубы</Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard">
                    <Button variant="ghost" className={getButtonStyle("/admin/dashboard")}>
                      Админка
                    </Button>
                  </Link>
                )}
                <Link to={isClubProfile ? "/club-profile" : "/profile"}>
                  <Button variant="outline" className={getButtonStyle(isClubProfile ? "/club-profile" : "/profile")}>
                    Профиль
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Войти</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="outline">Зарегистрироваться</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DiaryNavigation;
