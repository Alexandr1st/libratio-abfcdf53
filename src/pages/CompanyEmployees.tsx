import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyEmployees } from "@/hooks/useCompanyEmployees";
import { useToast } from "@/hooks/use-toast";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import AssignBookModal from "@/components/AssignBookModal";

interface Employee {
  id: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    position: string | null;
  } | null;
}

const CompanyEmployees = () => {
  const { user, loading: authLoading } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: employees, isLoading } = useCompanyEmployees(companyId || "");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchCompanyId();
    }
  }, [user, authLoading, navigate]);

  const fetchCompanyId = async () => {
    if (!user) return;

    try {
      // Проверяем, является ли пользователь контактным лицом компании
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: companyData, error } = await supabase
        .from('companies')
        .select('id')
        .eq('contact_person_id', user.id)
        .single();

      if (error || !companyData) {
        navigate("/profile");
        return;
      }

      setCompanyId(companyData.id);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные компании",
        variant: "destructive",
      });
    }
  };

  const handleAssignBook = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAssignModalOpen(true);
  };

  if (authLoading || isLoading || !companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-lg text-gray-600">Загрузка участников...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="mr-3 h-6 w-6" />
                Мои участники
              </span>
            </CardTitle>
            <CardDescription>
              Управляйте назначением книг для участников вашего клуба
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employees && employees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Участник</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Текущая книга</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.profiles?.full_name || "Не указано"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {employee.profiles?.position || "Не указано"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        Не назначена
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAssignBook(employee)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Добавить книгу
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет участников
                </h3>
                <p className="text-gray-500">
                  В вашем клубе пока нет зарегистрированных участников
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignBookModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        employee={selectedEmployee}
        companyId={companyId}
      />
    </div>
  );
};

export default CompanyEmployees;