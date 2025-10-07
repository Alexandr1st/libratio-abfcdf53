import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Mail, Bell, Shield } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [userRegistration, setUserRegistration] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "Настройки сохранены",
      description: "Изменения успешно применены",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
          <p className="text-gray-600">Управление параметрами и конфигурацией</p>
        </div>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email уведомления
            </CardTitle>
            <CardDescription>
              Настройка email-рассылок и уведомлений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email уведомления</Label>
                <div className="text-sm text-gray-500">
                  Отправлять email при важных событиях
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP сервер</Label>
              <Input
                id="smtp-server"
                placeholder="smtp.example.com"
                defaultValue="smtp.gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-email">Email отправителя</Label>
              <Input
                id="sender-email"
                type="email"
                placeholder="noreply@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Системные уведомления
            </CardTitle>
            <CardDescription>
              Настройка системных оповещений и алертов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-alerts">Системные алерты</Label>
                <div className="text-sm text-gray-500">
                  Показывать критические системные уведомления
                </div>
              </div>
              <Switch
                id="system-alerts"
                checked={systemAlerts}
                onCheckedChange={setSystemAlerts}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Безопасность
            </CardTitle>
            <CardDescription>
              Параметры безопасности и доступа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="user-registration">Регистрация пользователей</Label>
                <div className="text-sm text-gray-500">
                  Разрешить регистрацию новых пользователей
                </div>
              </div>
              <Switch
                id="user-registration"
                checked={userRegistration}
                onCheckedChange={setUserRegistration}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Таймаут сессии (минуты)</Label>
              <Input
                id="session-timeout"
                type="number"
                placeholder="30"
                defaultValue="30"
              />
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Общие настройки
            </CardTitle>
            <CardDescription>
              Основные параметры системы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Название сайта</Label>
              <Input
                id="site-name"
                placeholder="Название"
                defaultValue="Библиотека"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-description">Описание сайта</Label>
              <Textarea
                id="site-description"
                placeholder="Описание вашего сайта"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Сохранить настройки
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
