import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, UserCheck, UserX } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Partner {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/partner-login");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !roles) {
        toast.error("Neturite administratoriaus teisių");
        navigate("/partner-dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchPartners();
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Klaida tikrinant prieigą");
      navigate("/partner-login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for each user
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const partnersWithRoles = profiles?.map(profile => {
        const userRole = userRoles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role
        };
      }) || [];

      setPartners(partnersWithRoles);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Klaida gaunant partnerius");
    }
  };

  const togglePartnerRole = async (userId: string, currentRole?: string) => {
    try {
      if (currentRole === "partner") {
        // Remove partner role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "partner");

        if (error) throw error;
        toast.success("Partnerio teisės pašalintos");
      } else {
        // Add partner role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "partner" });

        if (error) throw error;
        toast.success("Partnerio teisės suteiktos");
      }

      await fetchPartners();
    } catch (error) {
      console.error("Error toggling partner role:", error);
      toast.error("Klaida keičiant teises");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Kraunama...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Administratoriaus valdymas</h1>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Atsijungti
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Partneriai ir vartotojai</h2>
          
          {partners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Partnerių nerasta
            </p>
          ) : (
            <div className="space-y-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{partner.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sukurta: {new Date(partner.created_at).toLocaleDateString('lt-LT')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {partner.role === "admin" ? (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        Administratorius
                      </span>
                    ) : partner.role === "partner" ? (
                      <>
                        <span className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm font-medium">
                          Partneris
                        </span>
                        <Button
                          onClick={() => togglePartnerRole(partner.id, partner.role)}
                          variant="outline"
                          size="sm"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Pašalinti teises
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                          Vartotojas
                        </span>
                        <Button
                          onClick={() => togglePartnerRole(partner.id, partner.role)}
                          variant="default"
                          size="sm"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Suteikti teises
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
