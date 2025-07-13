
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
  industry?: string;
  location?: string;
  website?: string;
}

interface CreateCompanyDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CreateCompanyDialog = ({ open, setOpen }: CreateCompanyDialogProps) => {
  const createCompany = useCreateCompany();

  const form = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      location: "",
      website: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await createCompany.mutateAsync(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Регистрация новой компании</DialogTitle>
          <DialogDescription>
            Заполните информацию о вашей компании для создания корпоративного читательского сообщества.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Название компании обязательно" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название компании *</FormLabel>
                  <FormControl>
                    <Input placeholder="ООО 'Технологии будущего'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Отрасль</FormLabel>
                  <FormControl>
                    <Input placeholder="IT, финансы, образование..." {...field} />
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
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Веб-сайт</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание компании</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Расскажите о вашей компании..."
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
                  "Создать компанию"
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
