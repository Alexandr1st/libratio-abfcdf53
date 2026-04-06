import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAdminRoles";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const DiaryNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isClubProfile, setIsClubProfile] = useState(false);
  const { data: isAdmin } = useIsAdmin();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const checkClubProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('club_id')
          .eq('id', user.id)
          .single();
        
        setIsClubProfile(!!data?.club_id);
      }
    };
    
    checkClubProfile();
  }, [user]);

  // Close sheet on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  
  const getButtonStyle = (path: string) => {
    return location.pathname === path 
      ? "text-blue-600 bg-blue-50" 
      : "";
  };

  const navLinks = user ? (
    <>
      {isClubProfile && (
        <Link to="/club-members">
          <Button variant="ghost" className={`w-full justify-start ${getButtonStyle("/club-members")}`}>
            Мой клуб
          </Button>
        </Link>
      )}
      <Link to="/books">
        <Button variant="ghost" className={`w-full justify-start ${getButtonStyle("/books")}`}>
          Каталог книг
        </Button>
      </Link>
      {isClubProfile && (
        <Link to="/club-library">
          <Button variant="ghost" className={`w-full justify-start ${getButtonStyle("/club-library")}`}>
            Библиотека клуба
          </Button>
        </Link>
      )}
      <Link to="/diary">
        <Button variant="ghost" className={`w-full justify-start ${getButtonStyle("/diary")}`}>
          Мой дневник
        </Button>
      </Link>
      <Link to="/clubs">
        <Button variant="ghost" className={`w-full justify-start ${getButtonStyle("/clubs")}`}>
          Клубы
        </Button>
      </Link>
      {isAdmin && (
        <Link to="/admin/dashboard">
          <Button variant="ghost" className={`w-full justify-start ${getButtonStyle("/admin/dashboard")}`}>
            Админка
          </Button>
        </Link>
      )}
      <Link to="/messages">
        <Button variant="ghost" className={`w-full justify-start ${getButtonStyle("/messages")}`}>
          <MessageCircle className="mr-1 h-4 w-4" />
          Сообщения
        </Button>
      </Link>
      <Link to="/profile">
        <Button variant="outline" className={`w-full justify-start ${getButtonStyle("/profile")}`}>
          Профиль
        </Button>
      </Link>
    </>
  ) : (
    <>
      <Link to="/auth">
        <Button variant="ghost" className="w-full justify-start">Войти</Button>
      </Link>
      <Link to="/auth?mode=signup">
        <Button variant="outline" className="w-full justify-start">Зарегистрироваться</Button>
      </Link>
    </>
  );
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Libratio</span>
          </Link>

          {isMobile ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 pt-10">
                <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                <div className="flex flex-col space-y-1">
                  {navLinks}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              {navLinks}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DiaryNavigation;
