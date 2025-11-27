
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateCompany } from "@/hooks/useCompanies";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CompanyFormData {
  name: string;
  description?: string;
  location?: string;
  chat_link?: string;
  logo?: File;
}

interface CreateCompanyDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CreateCompanyDialog = ({ open, setOpen }: CreateCompanyDialogProps) => {
  const createCompany = useCreateCompany();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      description: "",
      location: "",
      chat_link: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await createCompany.mutateAsync({ 
        companyData: {
          name: data.name,
          description: data.description || null,
          location: data.location || null,
          website: data.chat_link || null,
        },
        logo: logoFile 
      });
      setOpen(false);
      form.reset();
      setLogoFile(null);
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Регистрация нового клуба</DialogTitle>
          <DialogDescription>
            Заполните информацию о вашем клубе для создания читательского сообщества.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Название клуба обязательно" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название клуба *</FormLabel>
                  <FormControl>
                    <Input placeholder="ООО 'Технологии будущего'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Местоположение</FormLabel>
                  <FormControl>
                    <Input placeholder="Москва, Россия" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chat_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ссылка на чат</FormLabel>
                  <FormControl>
                    <Input placeholder="https://t.me/yourgroup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Логотип клуба</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLogoFile(file);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание клуба</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Расскажите о вашем клубе..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createCompany.isPending}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={createCompany.isPending}>
                {createCompany.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать клуб"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;
