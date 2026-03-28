import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/autokopers-logo.jpeg";
import { useLanguage } from "@/contexts/LanguageContext";

const SIGNUP_RATE_LIMIT = 3;
const SIGNUP_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MIN_FORM_TIME_MS = 3000; // 3 seconds minimum

const getSignupAttempts = (): number[] => {
  try {
    const raw = sessionStorage.getItem("_sa");
    if (!raw) return [];
    const attempts: number[] = JSON.parse(raw);
    const now = Date.now();
    return attempts.filter(t => now - t < SIGNUP_RATE_WINDOW_MS);
  } catch {
    return [];
  }
};

const recordSignupAttempt = () => {
  const attempts = getSignupAttempts();
  attempts.push(Date.now());
  sessionStorage.setItem("_sa", JSON.stringify(attempts));
};

const Auth = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", fullName: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  // Honeypot — invisible field that bots fill in
  const [honeypot, setHoneypot] = useState("");
  // Track when form was rendered to detect bot-speed submissions
  const formRenderedAt = useRef(Date.now());

  useEffect(() => {
    formRenderedAt.current = Date.now();
  }, []);

  const authSchema = z.object({
    email: z.string().trim().email(language === "lt" ? "Neteisingas el. pašto formatas" : "Invalid email format"),
    password: z.string().min(8, language === "lt" ? "Slaptažodis turi būti bent 8 simbolių" : "Password must be at least 8 characters"),
    fullName: z.string().trim().min(2, language === "lt" ? "Vardas per trumpas" : "Name too short").max(100).optional(),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse(loginData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      
      toast.success(t("auth.loginSuccess"));
      navigate("/partner-dashboard");
    } catch (error: any) {
      toast.error(error.message || (language === "lt" ? "Prisijungimo klaida" : "Login error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — real users never fill this
    if (honeypot) {
      // Silently pretend success to confuse bots
      toast.success(t("auth.signupSuccess"));
      return;
    }

    // Speed check — bots submit instantly
    const elapsed = Date.now() - formRenderedAt.current;
    if (elapsed < MIN_FORM_TIME_MS) {
      toast.success(t("auth.signupSuccess"));
      return;
    }

    // Rate limit check
    const attempts = getSignupAttempts();
    if (attempts.length >= SIGNUP_RATE_LIMIT) {
      toast.error(language === "lt" 
        ? "Per daug registracijos bandymų. Bandykite vėliau." 
        : "Too many signup attempts. Please try again later.");
      return;
    }
    
    const validation = authSchema.safeParse(signupData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    // Block disposable email domains
    const disposableDomains = ["mailinator.com", "tempmail.com", "throwaway.email", "guerrillamail.com", "sharklasers.com", "grr.la", "guerrillamailblock.com", "pokemail.net", "spam4.me", "yopmail.com", "10minutemail.com", "trashmail.com", "maildrop.cc", "dispostable.com", "nowhere.invalid"];
    const emailDomain = signupData.email.split("@")[1]?.toLowerCase();
    if (emailDomain && disposableDomains.includes(emailDomain)) {
      toast.error(language === "lt" 
        ? "Laikini el. pašto adresai neleidžiami" 
        : "Temporary email addresses are not allowed");
      return;
    }

    setIsLoading(true);
    recordSignupAttempt();
    
    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/partner-dashboard`,
          data: {
            full_name: signupData.fullName,
          }
        }
      });

      if (error) throw error;
      
      toast.success(language === "lt" 
        ? "Registracija sėkminga! Patikrinkite el. paštą ir patvirtinkite paskyrą." 
        : "Registration successful! Check your email to confirm your account.");
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error(language === "lt" ? "Šis el. paštas jau registruotas" : "This email is already registered");
      } else {
        toast.error(error.message || (language === "lt" ? "Registracijos klaida" : "Registration error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast.error(language === "lt" ? "Įveskite el. paštą" : "Enter your email");
      return;
    }

    const emailValidation = z.string().email();
    if (!emailValidation.safeParse(resetEmail).success) {
      toast.error(language === "lt" ? "Neteisingas el. pašto formatas" : "Invalid email format");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/partner-dashboard`,
      });

      if (error) throw error;
      
      toast.success(t("auth.resetEmailSent"));
      setShowResetForm(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || (language === "lt" ? "Klaida siunčiant nuorodą" : "Error sending link"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex justify-center">
          <img src={logo} alt="AutoKOPERS logotipas" className="h-16" />
        </Link>
        <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t("nav.partnerZone")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {!showResetForm ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetForm(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      {t("auth.forgotPassword")}
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (language === "lt" ? "Jungiamasi..." : "Logging in...") : t("auth.login")}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">{t("auth.email")}</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowResetForm(false);
                        setResetEmail("");
                      }}
                      className="flex-1"
                    >
                      {t("common.back")}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (language === "lt" ? "Siunčiama..." : "Sending...") : t("auth.sendResetLink")}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Honeypot field — invisible to users, bots fill it in */}
                <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                  <Input
                    type="text"
                    name="website_url"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t("auth.fullName")}</Label>
                  <Input
                    id="signup-name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("auth.email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    {t("auth.password")} ({language === "lt" ? "min. 8 simboliai" : "min. 8 characters"})
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (language === "lt" ? "Kuriama..." : "Creating...") : t("auth.signup")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
