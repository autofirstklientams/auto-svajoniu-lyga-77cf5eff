import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, LogIn, UserPlus } from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.png";

const authSchema = z.object({
  email: z.string().email("Neteisingas el. pašto formatas"),
  password: z.string().min(6, "Slaptažodis turi būti bent 6 simbolių"),
});

const InvoiceAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Šis el. paštas jau užregistruotas");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Registracija sėkminga! Galite prisijungti.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Neteisingas el. paštas arba slaptažodis");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Sėkmingai prisijungėte!");
          navigate("/invoice");
        }
      }
    } catch (error) {
      toast.error("Įvyko klaida. Bandykite dar kartą.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="form-section animate-fade-in">
          <div className="text-center mb-8">
            <img src={logo} alt="Auto Kopers" className="h-12 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isSignUp ? "Registracija" : "Prisijungimas"}
            </h1>
            <p className="text-muted-foreground">
              Sąskaitų generatorius
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">El. paštas</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jusu@email.lt"
                  className="pl-10 input-elegant"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Slaptažodis</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 input-elegant"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                "Palaukite..."
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registruotis
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Prisijungti
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp
                ? "Jau turite paskyrą? Prisijunkite"
                : "Neturite paskyros? Registruokitės"}
            </button>
          </div>
        </div>

        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 MB "Autodealeriai" · autokopers.lt</p>
        </footer>
      </div>
    </div>
  );
};

export default InvoiceAuth;
