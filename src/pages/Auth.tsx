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
import { userRegistrationSchema, userLoginSchema, clubSchema, getFirstError } from "@/lib/validations";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "club">("individual");
  
  // Club specific fields
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubLocation, setClubLocation] = useState("");
  const [clubChatLink, setClubChatLink] = useState("");
  
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
    
    // Validate user registration data
    const userValidation = userRegistrationSchema.safeParse({
      email,
      password,
      full_name: fullName,
      username: accountType === "individual" ? username : null,
    });

    if (!userValidation.success) {
      toast({
        title: "Ошибка валидации",
        description: getFirstError(userValidation.error),
        variant: "destructive",
      });
      return;
    }

    // Validate club data if registering as club
    if (accountType === "club") {
      const clubValidation = clubSchema.safeParse({
        name: clubName,
        description: clubDescription || null,
        location: clubLocation || null,
        website: clubChatLink || null,
      });

      if (!clubValidation.success) {
        toast({
          title: "Ошибка валидации клуба",
          description: getFirstError(clubValidation.error),
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

      // If club registration and user was created, create club
      if (accountType === "club" && authData.user) {
        // Create club
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .insert({
            name: clubName,
            description: clubDescription || null,
            location: clubLocation || null,
            website: clubChatLink || null,
          })
          .select()
          .single();

        if (clubError) {
          console.error('Error creating club:', clubError);
        } else if (clubData) {
          // Add user as club admin
          const { error: memberError } = await supabase
            .from('club_members')
            .insert({
              club_id: clubData.id,
              user_id: authData.user.id,
              is_admin: true,
            });

          if (memberError) {
            console.error('Error adding user to club:', memberError);
          }

          // Update user profile with club info
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              club_id: clubData.id,
              club_name: clubName,
            })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
        }
      }

      toast({
        title: "Регистрация успешна!",
        description: accountType === "club" 
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
    
    // Validate login data
    const loginValidation = userLoginSchema.safeParse({ email, password });
    
    if (!loginValidation.success) {
      toast({
        title: "Ошибка",
        description: getFirstError(loginValidation.error),
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
                      onValueChange={(value) => setAccountType(value as "individual" | "club")}
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
                        <RadioGroupItem value="club" id="club" />
                        <Label htmlFor="club" className="flex items-center space-x-2 cursor-pointer">
                          <Building2 className="h-4 w-4" />
                          <span>Клуб</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Common Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      {accountType === "club" ? "Ваше имя (контактное лицо)" : "Полное имя"}
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={accountType === "club" ? "Иван Петров" : "Иван Петров"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      maxLength={100}
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
                        maxLength={30}
                        pattern="^[a-zA-Z0-9_]+$"
                        title="Только буквы, цифры и подчеркивания"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {/* Club-specific fields */}
                  {accountType === "club" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="clubName">Название клуба *</Label>
                        <Input
                          id="clubName"
                          type="text"
                          placeholder="Книжный клуб"
                          value={clubName}
                          onChange={(e) => setClubName(e.target.value)}
                          maxLength={200}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clubLocation">Местоположение</Label>
                        <Input
                          id="clubLocation"
                          type="text"
                          placeholder="Москва, Россия"
                          value={clubLocation}
                          onChange={(e) => setClubLocation(e.target.value)}
                          maxLength={200}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clubChatLink">Ссылка на чат</Label>
                        <Input
                          id="clubChatLink"
                          type="url"
                          placeholder="https://t.me/yourgroup"
                          value={clubChatLink}
                          onChange={(e) => setClubChatLink(e.target.value)}
                          maxLength={500}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clubDescription">Описание клуба</Label>
                        <Textarea
                          id="clubDescription"
                          placeholder="Краткое описание клуба..."
                          value={clubDescription}
                          onChange={(e) => setClubDescription(e.target.value)}
                          rows={3}
                          maxLength={1000}
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
                  maxLength={255}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль {!isLogin && "(мин. 8 символов, A-Z, a-z, 0-9)"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={72}
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
