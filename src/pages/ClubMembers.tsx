import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import AssignBookModal from "@/components/AssignBookModal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ClubMembers = () => {
  const { user, loading: authLoading } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch members from profiles table with their current reading book
  const { data: members, isLoading } = useQuery({
    queryKey: ['club-members-profiles', clubId],
    queryFn: async () => {
      // First get all members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('club_id', clubId!);
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length === 0) return [];
      
      // Get current reading books for all members
      const memberIds = profiles.map(p => p.id);
      const { data: diaryEntries, error: diaryError } = await supabase
        .from('diary_entries')
        .select('user_id, book_id, books(title)')
        .in('user_id', memberIds)
        .eq('status', 'reading');
      
      if (diaryError) throw diaryError;
      
      // Map diary entries to members
      return profiles.map(profile => ({
        ...profile,
        currentBook: diaryEntries?.find(e => e.user_id === profile.id)?.books?.title || null
      }));
    },
    enabled: !!clubId,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) { navigate("/auth"); return; }
      fetchClubId();
    }
  }, [user, authLoading, navigate]);

  const fetchClubId = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('clubs').select('id').eq('contact_person_id', user.id).single();
      if (error || !data) { navigate("/profile"); return; }
      setClubId(data.id);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить данные клуба", variant: "destructive" });
    }
  };

  const handleAssignBook = (member: any) => { setSelectedMember(member); setIsAssignModalOpen(true); };

  if (authLoading || isLoading || !clubId) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-3 h-6 w-6" />Мои участники</CardTitle>
            <CardDescription>Управляйте назначением книг для участников вашего клуба</CardDescription>
          </CardHeader>
          <CardContent>
            {members && members.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Участник</TableHead><TableHead>Текущая книга</TableHead><TableHead className="text-right">Действия</TableHead></TableRow></TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.full_name || "Не указано"}</TableCell>
                      <TableCell className="text-muted-foreground">{member.currentBook || "Не назначена"}</TableCell>
                      <TableCell className="text-right"><Button size="sm" onClick={() => handleAssignBook(member)}><Plus className="mr-2 h-4 w-4" />Добавить книгу</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12"><Users className="h-16 w-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Нет участников</h3></div>
            )}
          </CardContent>
        </Card>
      </div>
      <AssignBookModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} employee={selectedMember} companyId={clubId} />
    </div>
  );
};

export default ClubMembers;
