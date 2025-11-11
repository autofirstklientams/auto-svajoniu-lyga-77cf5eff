import { useState } from "react";
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

const authSchema = z.object({
  email: z.string().trim().email("Neteisingas el. pašto formatas"),
  password: z.string().min(6, "Slaptažodis turi būti bent 6 simbolių"),
  fullName: z.string().trim().min(1, "Vardas privalomas").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", fullName: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

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
      
      toast.success("Sėkmingai prisijungėte!");
      navigate("/partner-dashboard");
    } catch (error: any) {
      toast.error(error.message || "Prisijungimo klaida");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse(signupData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
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
      
      toast.success("Paskyra sukurta! Prisijunkite.");
      setLoginData({ email: signupData.email, password: signupData.password });
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("Šis el. paštas jau registruotas");
      } else {
        toast.error(error.message || "Registracijos klaida");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast.error("Įveskite el. paštą");
      return;
    }

    const emailValidation = z.string().email();
    if (!emailValidation.safeParse(resetEmail).success) {
      toast.error("Neteisingas el. pašto formatas");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/partner-dashboard`,
      });

      if (error) throw error;
      
      toast.success("Slaptažodžio atnaujinimo nuoroda išsiųsta į el. paštą");
      setShowResetForm(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Klaida siunčiant nuorodą");
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
          <CardTitle className="text-2xl text-center">Partnerio zona</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Prisijungti</TabsTrigger>
              <TabsTrigger value="signup">Registruotis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {!showResetForm ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">El. paštas</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Slaptažodis</Label>
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
                      Pamiršau slaptažodį
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Jungiamasi..." : "Prisijungti"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">El. paštas</Label>
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
                      Atgal
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Siunčiama..." : "Siųsti nuorodą"}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Vardas, Pavardė</Label>
                  <Input
                    id="signup-name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">El. paštas</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Slaptažodis (min. 6 simboliai)</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Kuriama..." : "Registruotis"}
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
