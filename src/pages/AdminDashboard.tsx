import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, UserCheck, UserX, Car, Trash2, Eye, FileText, Shield, ShieldOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Partner {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role?: string;
}

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  image_url: string | null;
  partner_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

// Super admin - apsaugotas nuo pašalinimo
const SUPER_ADMIN_ID = "02984778-7f5d-4547-9581-f3f81d8c87e0";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [allCars, setAllCars] = useState<CarListing[]>([]);

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

      setCurrentUserId(user.id);

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
      await fetchAllCars();
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

  const fetchAllCars = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select(`
          *,
          profiles:partner_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllCars(data || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Klaida gaunant automobilius");
    }
  };

  const togglePartnerRole = async (userId: string, currentRole?: string) => {
    if (userId === SUPER_ADMIN_ID) {
      toast.error("Negalima keisti pagrindinio administratoriaus teisių");
      return;
    }

    try {
      if (currentRole === "partner") {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "partner");

        if (error) throw error;
        toast.success("Partnerio teisės pašalintos");
      } else {
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

  const toggleAdminRole = async (userId: string, hasAdminRole: boolean) => {
    if (userId === SUPER_ADMIN_ID) {
      toast.error("Negalima keisti pagrindinio administratoriaus teisių");
      return;
    }

    if (userId === currentUserId) {
      toast.error("Negalite pašalinti savo paties admin teisių");
      return;
    }

    try {
      if (hasAdminRole) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;
        toast.success("Admin teisės pašalintos");
      } else {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;
        toast.success("Admin teisės suteiktos");
      }

      await fetchPartners();
    } catch (error) {
      console.error("Error toggling admin role:", error);
      toast.error("Klaida keičiant admin teises");
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userId === SUPER_ADMIN_ID) {
      toast.error("Negalima ištrinti pagrindinio administratoriaus");
      return;
    }

    if (userId === currentUserId) {
      toast.error("Negalite ištrinti savo paskyros");
      return;
    }

    if (!confirm(`Ar tikrai norite ištrinti vartotoją ${userEmail}?`)) return;

    try {
      // Delete user's cars first
      await supabase.from("cars").delete().eq("partner_id", userId);
      
      // Delete user roles
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      // Delete profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      
      if (error) throw error;
      
      toast.success("Vartotojas ištrintas");
      await fetchPartners();
      await fetchAllCars();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Klaida trinant vartotoją");
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį automobilį?")) return;

    try {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("id", carId);

      if (error) throw error;
      
      toast.success("Automobilis ištrintas");
      await fetchAllCars();
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Klaida trinant automobilį");
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Administratoriaus valdymas</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/invoice")} variant="default">
              <FileText className="h-4 w-4 mr-2" />
              Sąskaitų generatorius
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Atsijungti
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Vartotojai
            </TabsTrigger>
            <TabsTrigger value="cars">
              <Car className="h-4 w-4 mr-2" />
              Visi skelbimai ({allCars.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
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
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Super admin badge */}
                        {partner.id === SUPER_ADMIN_ID && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-medium">
                            Pagrindinis Admin
                          </span>
                        )}
                        
                        {/* Role badges */}
                        {partner.role === "admin" ? (
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            Administratorius
                          </span>
                        ) : partner.role === "partner" ? (
                          <span className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm font-medium">
                            Partneris
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                            Vartotojas
                          </span>
                        )}

                        {/* Admin toggle button - not for super admin or self */}
                        {partner.id !== SUPER_ADMIN_ID && partner.id !== currentUserId && (
                          partner.role === "admin" ? (
                            <Button
                              onClick={() => toggleAdminRole(partner.id, true)}
                              variant="outline"
                              size="sm"
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Pašalinti admin
                            </Button>
                          ) : (
                            <Button
                              onClick={() => toggleAdminRole(partner.id, false)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Suteikti admin
                            </Button>
                          )
                        )}

                        {/* Partner role toggle - only for non-admins */}
                        {partner.role !== "admin" && partner.id !== SUPER_ADMIN_ID && (
                          partner.role === "partner" ? (
                            <Button
                              onClick={() => togglePartnerRole(partner.id, partner.role)}
                              variant="outline"
                              size="sm"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Pašalinti partnerio
                            </Button>
                          ) : (
                            <Button
                              onClick={() => togglePartnerRole(partner.id, partner.role)}
                              variant="default"
                              size="sm"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Suteikti partnerio
                            </Button>
                          )
                        )}

                        {/* Delete button - not for super admin, self, or admins */}
                        {partner.id !== SUPER_ADMIN_ID && partner.id !== currentUserId && partner.role !== "admin" && (
                          <Button
                            onClick={() => handleDeleteUser(partner.id, partner.email)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="cars">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Visi automobilių skelbimai</h2>
              
              {allCars.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Skelbimų nerasta
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCars.map((car) => (
                    <Card key={car.id} className="overflow-hidden">
                      {car.image_url && (
                        <img
                          src={car.image_url}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-2xl font-bold text-primary mb-2">
                          {car.price.toLocaleString()} €
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1 mb-3">
                          <p>Metai: {car.year}</p>
                          <p>Rida: {car.mileage?.toLocaleString() || "N/A"} km</p>
                          {car.profiles && (
                            <p className="text-xs mt-2 pt-2 border-t border-border">
                              Partneris: {car.profiles.full_name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(`/car/${car.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Peržiūrėti
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCar(car.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
