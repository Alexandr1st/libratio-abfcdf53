
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
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
    if (!email || !password || !fullName || !username) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка регистрации",
        description: error.message === "User already registered" 
          ? "Пользователь с таким email уже зарегистрирован" 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Регистрация успешна!",
        description: "Проверьте свою почту для подтверждения аккаунта",
      });
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
          <span className="text-2xl font-bold text-gray-900">ReadConnect</span>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Вход в аккаунт" : "Создать аккаунт"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? "Войдите в свой аккаунт ReadConnect" 
                : "Создайте аккаунт для ведения читательского дневника"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Полное имя</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Иван Петров"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  
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
