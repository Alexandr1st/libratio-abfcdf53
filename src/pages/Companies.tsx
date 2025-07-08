
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Building2, Search, Users, TrendingUp, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface Company {
  id: number;
  name: string;
  industry: string;
  employeeCount: number;
  location: string;
  logo: string;
  description: string;
  activeReaders: number;
  topBooks: Array<{
    title: string;
    author: string;
    readers: number;
    image: string;
  }>;
  averageRating: number;
}

const mockCompanies: Company[] = [
  {
    id: 1,
    name: "TechCorp",
    industry: "Информационные технологии",
    employeeCount: 250,
    location: "Москва",
    logo: "🏢",
    description: "Ведущая IT-компания, специализирующаяся на разработке корпоративных решений",
    activeReaders: 89,
    averageRating: 4.6,
    topBooks: [
      { title: "Чистый код", author: "Роберт Мартин", readers: 45, image: "📚" },
      { title: "Microservices Patterns", author: "Chris Richardson", readers: 23, image: "📖" },
      { title: "System Design Interview", author: "Alex Xu", readers: 34, image: "⚙️" }
    ]
  },
  {
    id: 2,
    name: "InnovateLab",
    industry: "Стартап",
    employeeCount: 75,
    location: "Санкт-Петербург",
    logo: "🚀",
    description: "Инновационная лаборатория, создающая продукты будущего",
    activeReaders: 42,
    averageRating: 4.8,
    topBooks: [
      { title: "Lean Startup", author: "Эрик Рис", readers: 34, image: "🚀" },
      { title: "Zero to One", author: "Питер Тиль", readers: 28, image: "💡" },
      { title: "The Hard Thing About Hard Things", author: "Бен Горовиц", readers: 19, image: "💪" }
    ]
  },
  {
    id: 3,
    name: "DesignStudio",
    industry: "Дизайн и UX",
    employeeCount: 45,
    location: "Новосибирск",
    logo: "🎨",
    description: "Дизайн-студия, создающая выдающиеся пользовательские интерфейсы",
    activeReaders: 31,
    averageRating: 4.7,
    topBooks: [
      { title: "Дизайн повседневных вещей", author: "Дон Норман", readers: 28, image: "🎨" },
      { title: "About Face", author: "Алан Купер", readers: 15, image: "😊" },
      { title: "Steal Like an Artist", author: "Остин Клеон", readers: 22, image: "🖼️" }
    ]
  },
  {
    id: 4,
    name: "DataTech Solutions",
    industry: "Анализ данных",
    employeeCount: 120,
    location: "Екатеринбург",
    logo: "📊",
    description: "Компания по анализу данных и машинному обучению",
    activeReaders: 56,
    averageRating: 4.5,
    topBooks: [
      { title: "Python for Data Analysis", author: "Уэс Маккинни", readers: 38, image: "🐍" },
      { title: "Hands-On Machine Learning", author: "Орельен Жерон", readers: 29, image: "🤖" },
      { title: "The Data Warehouse Toolkit", author: "Ральф Кимбалл", readers: 21, image: "🏗️" }
    ]
  },
  {
    id: 5,
    name: "FinanceFirst",
    industry: "Финансы",
    employeeCount: 180,
    location: "Москва",
    logo: "💰",
    description: "Финтех-компания, разрабатывающая современные банковские решения",
    activeReaders: 67,
    averageRating: 4.4,
    topBooks: [
      { title: "Принципы", author: "Рэй Далио", readers: 43, image: "📈" },
      { title: "Черный лебедь", author: "Нассим Талеб", readers: 35, image: "🦢" },
      { title: "Thinking, Fast and Slow", author: "Даниэль Канеман", readers: 28, image: "🧠" }
    ]
  },
  {
    id: 6,
    name: "GreenTech Innovations",
    industry: "Экотехнологии",
    employeeCount: 95,
    location: "Казань",
    logo: "🌱",
    description: "Разработка экологически чистых технологических решений",
    activeReaders: 38,
    averageRating: 4.9,
    topBooks: [
      { title: "Cradle to Cradle", author: "Майкл Браунгарт", readers: 25, image: "♻️" },
      { title: "The Sixth Extinction", author: "Элизабет Колберт", readers: 19, image: "🌍" },
      { title: "Biomimicry", author: "Джанин Беньюс", readers: 16, image: "🍃" }
    ]
  }
];

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("Все");

  const industries = ["Все", "Информационные технологии", "Стартап", "Дизайн и UX", "Анализ данных", "Финансы", "Экотехнологии"];

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "Все" || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ReadConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/books">
                <Button variant="ghost">Каталог книг</Button>
              </Link>
              <Link to="/companies">
                <Button variant="ghost" className="text-blue-600">Компании</Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline">Профиль</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Каталог компаний</h1>
          <p className="text-lg text-gray-600">Узнайте, что читают в разных компаниях и найдите единомышленников</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию компании..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <Badge
                key={industry}
                variant={selectedIndustry === industry ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => setSelectedIndustry(industry)}
              >
                {industry}
              </Badge>
            ))}
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{company.logo}</div>
                    <div>
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      <CardDescription className="text-base mb-2">
                        {company.industry}
                      </CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{company.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{company.employeeCount} сотрудников</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{company.averageRating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-gray-600">{company.description}</p>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Активных читателей</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {company.activeReaders}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Популярные книги</h4>
                    <div className="space-y-2">
                      {company.topBooks.map((book, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{book.image}</span>
                            <div>
                              <p className="font-medium text-sm">{book.title}</p>
                              <p className="text-xs text-gray-500">{book.author}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {book.readers} читателей
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    Присоединиться к сообществу
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">Компании не найдены</h3>
            <p className="text-gray-400">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
