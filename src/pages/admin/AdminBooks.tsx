import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Book, Search, Star, Calendar, Plus } from "lucide-react";
import EditBookDialog from "@/components/admin/EditBookDialog";
import AddBookDialog from "@/components/admin/AddBookDialog";

const AdminBooks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBook, setEditingBook] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: books, isLoading } = useQuery({
    queryKey: ["adminBooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          diary_entries(id),
          company_books(id, companies(name))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredBooks = books?.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление книгами</h1>
          <p className="text-gray-600">Просмотр и управление каталогом книг</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию, автору или жанру..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5" />
              Книги ({filteredBooks?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBooks && filteredBooks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Книга</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Жанр</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Страниц</TableHead>
                    <TableHead>Читателей</TableHead>
                    <TableHead>Компании</TableHead>
                    <TableHead>Дата добавления</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {book.image && (
                            book.image.startsWith('http') ? (
                              <img 
                                src={book.image} 
                                alt={book.title} 
                                className="w-10 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-12 flex items-center justify-center text-2xl bg-gray-100 rounded">
                                {book.image}
                              </div>
                            )
                          )}
                          <div>
                            <div className="font-medium">{book.title}</div>
                            {book.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {book.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{book.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.genre}</Badge>
                      </TableCell>
                      <TableCell>
                        {book.rating ? (
                          <div className="flex items-center">
                            <Star className="mr-1 h-4 w-4 text-yellow-500 fill-current" />
                            {book.rating}
                          </div>
                        ) : (
                          <span className="text-gray-400">Нет рейтинга</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {book.pages || <span className="text-gray-400">Не указано</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {book.diary_entries?.length || 0} читателей
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {book.company_books?.map((companyBook, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {companyBook.companies?.name}
                            </Badge>
                          )) || <span className="text-gray-400">Нет в компаниях</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(book.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingBook(book);
                            setDialogOpen(true);
                          }}
                        >
                          Редактировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Книги не найдены' : 'Нет книг в каталоге'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditBookDialog
        book={editingBook}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <AddBookDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </AdminLayout>
  );
};

export default AdminBooks;