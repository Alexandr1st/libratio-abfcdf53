import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, MapPin, Globe, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useClubs } from "@/hooks/useClubs";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";

const Clubs = () => {
  const { data: clubs, isLoading, isError } = useClubs();
  const { toast } = useToast();

  if (isLoading) {
    return <div>Loading clubs...</div>;
  }

  if (isError) {
    toast({
      title: "Ошибка",
      description: "Не удалось загрузить клубы",
      variant: "destructive",
    });
    return <div>Error loading clubs.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Клубы</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs?.map((club) => (
            <Card key={club.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <Link to={`/clubs/${club.id}`} className="block">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {club.logo_url ? (
                        <AvatarImage src={club.logo_url} alt={club.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {club.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-semibold">{club.name}</CardTitle>
                      <Badge variant={club.club_type === 'online' ? 'secondary' : 'outline'} className="text-xs">
                        {club.club_type === 'online' ? '🌐 Онлайн' : '📍 Оффлайн'}
                      </Badge>
                    </div>
                  <CardDescription>{club.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Участники</span>
                  </div>
                  {club.location && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{club.location}</span>
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clubs;
