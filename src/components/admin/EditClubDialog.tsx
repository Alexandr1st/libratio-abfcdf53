import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Club {
  id: string;
  name: string;
  description?: string;
  location?: string;
  logo_url?: string;
  website?: string;
  club_type?: string;
}

interface EditClubDialogProps {
  club: Club | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditClubDialog = ({ club, open, onOpenChange }: EditClubDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    logo_url: "",
    club_type: "online",
  });

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || "",
        description: club.description || "",
        location: club.location || "",
        logo_url: club.logo_url || "",
        club_type: club.club_type || "online",
      });
    }
    setLogoFile(null);
  }, [club]);

  const updateClubMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!club) return;

      let logoUrl = data.logo_url;

      // Upload logo if file is selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${club.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('club-logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('club-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("clubs")
        .update({
          name: data.name,
          description: data.description || null,
          location: data.location || null,
          logo_url: logoUrl || null,
          club_type: data.club_type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", club.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminClubs"] });
      toast({
        title: "Клуб обновлен",
        description: "Информация о клубе успешно обновлена",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить клуб: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClubMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать клуб</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location">Местоположение</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <Label>Тип клуба</Label>
            <Select value={formData.club_type} onValueChange={(val) => setFormData({ ...formData, club_type: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">🌐 Онлайн</SelectItem>
                <SelectItem value="offline">📍 Оффлайн</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div>
            <Label htmlFor="logo">Логотип клуба</Label>
            {formData.logo_url && (
              <div className="mb-2">
                <img src={formData.logo_url} alt="Current logo" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoFile(file);
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={updateClubMutation.isPending}>
              {updateClubMutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClubDialog;
