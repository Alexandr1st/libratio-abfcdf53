
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Eye, EyeOff, User, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  
  // Company specific fields
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate common fields
    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните email и пароль",
        variant: "destructive",
      });
      return;
    }

    // Validate based on account type
    if (accountType === "individual") {
      if (!fullName || !username) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все поля",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!companyName || !companyIndustry || !fullName) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните название клуба, сферу деятельности и ваше имя",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: accountType === "individual" ? username : null,
            account_type: accountType,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // If company registration and user was created, create company
      if (accountType === "company" && authData.user) {
        // Create company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            description: companyDescription || null,
            industry: companyIndustry,
            location: companyLocation || null,
            website: companyWebsite || null,
          })
          .select()
          .single();

        if (companyError) {
          console.error('Error creating company:', companyError);
          // Note: User is still created, we could handle this better
        } else if (companyData) {
          // Add user as company admin
          const { error: employeeError } = await supabase
            .from('company_employees')
            .insert({
              company_id: companyData.id,
              user_id: authData.user.id,
              is_admin: true,
              position: "Администратор",
            });

          if (employeeError) {
            console.error('Error adding user to company:', employeeError);
          }

          // Update user profile with company info
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              company_id: companyData.id,
              company: companyName,
              position: "Администратор",
            })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
        }
      }

      toast({
        title: "Регистрация успешна!",
        description: accountType === "company" 
          ? "Клуб зарегистрирован. Проверьте почту для подтверждения аккаунта" 
          : "Проверьте свою почту для подтверждения аккаунта",
      });

    } catch (error: any) {
      toast({
        title: "Ошибка регистрации",
        description: error.message === "User already registered" 
          ? "Пользователь с таким email уже зарегистрирован" 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка входа",
        description: error.message === "Invalid login credentials" 
          ? "Неверный email или пароль" 
          : error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Libratio</span>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Вход в аккаунт" : "Создать аккаунт"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? "Войдите в свой аккаунт ReadConnect" 
                : "Создайте личный аккаунт или зарегистрируйте клуб"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Account Type Selection */}
                  <div className="space-y-3">
                    <Label>Тип аккаунта</Label>
                    <RadioGroup 
                      value={accountType} 
                      onValueChange={(value) => setAccountType(value as "individual" | "company")}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="flex items-center space-x-2 cursor-pointer">
                          <User className="h-4 w-4" />
                          <span>Физическое лицо</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company" className="flex items-center space-x-2 cursor-pointer">
                          <Building2 className="h-4 w-4" />
                          <span>Клуб</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Common Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      {accountType === "company" ? "Ваше имя (контактное лицо)" : "Полное имя"}
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={accountType === "company" ? "Иван Петров" : "Иван Петров"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>

                  {/* Individual-specific fields */}
                  {accountType === "individual" && (
                    <div className="space-y-2">
                      <Label htmlFor="username">Имя пользователя</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="ivan_petrov"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {/* Company-specific fields */}
                  {accountType === "company" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Название клуба *</Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="ООО 'Технологии'"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyIndustry">Сфера деятельности *</Label>
                        <Input
                          id="companyIndustry"
                          type="text"
                          placeholder="IT, Финансы, Образование и т.д."
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyLocation">Местоположение</Label>
                        <Input
                          id="companyLocation"
                          type="text"
                          placeholder="Москва, Россия"
                          value={companyLocation}
                          onChange={(e) => setCompanyLocation(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite">Веб-сайт</Label>
                        <Input
                          id="companyWebsite"
                          type="url"
                          placeholder="https://company.com"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyDescription">Описание клуба</Label>
                        <Textarea
                          id="companyDescription"
                          placeholder="Краткое описание деятельности клуба..."
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Загрузка..." : (isLogin ? "Войти" : "Зарегистрироваться")}
              </Button>
            </form>

            <div className="text-center text-sm">
              {isLogin ? (
                <span>
                  Нет аккаунта?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Зарегистрироваться
                  </button>
                </span>
              ) : (
                <span>
                  Уже есть аккаунт?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Войти
                  </button>
                </span>
              )}
            </div>

            <div className="text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Вернуться на главную
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
