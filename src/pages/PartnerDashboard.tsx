import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import CreateListing from "./CreateListing";
import { Plus, Search } from "lucide-react";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";
import { StatsCards } from "@/components/partner/StatsCards";
import { CarListingCard } from "@/components/partner/CarListingCard";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  transmission?: string | null;
  description?: string | null;
  image_url: string | null;
  body_type?: string | null;
  engine_capacity?: number | null;
  power_kw?: number | null;
  doors?: number | null;
  seats?: number | null;
  color?: string | null;
  steering_wheel?: string | null;
  condition?: string | null;
  vin?: string | null;
  defects?: string | null;
  features?: any;
  visible_web: boolean;
  visible_autoplius: boolean;
  visible_autolizingas: boolean;
  is_sold: boolean;
  is_reserved: boolean;
  partner_id?: string;
}

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canExportAutoplius, setCanExportAutoplius] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const userIdRef = React.useRef<string | null>(null);
  const lastCarsErrorAtRef = React.useRef<number>(0);
  const roleRetryTimeoutRef = React.useRef<number | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      userIdRef.current = session?.user?.id ?? null;
      setIsLoading(false);

      if (!session) {
        navigate("/partner-login");
      } else {
        checkUserRole(session.user.id);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        userIdRef.current = session?.user?.id ?? null;

        if (!session) {
          navigate("/partner-login");
        } else {
          checkUserRole(session.user.id);
        }
      }
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userIdRef.current) {
        checkUserRole(userIdRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (roleRetryTimeoutRef.current) {
        window.clearTimeout(roleRetryTimeoutRef.current);
      }
    };
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error checking user role:", error);
        scheduleRoleRetry(userId);
        return;
      }

      const hasAdminRole = roles?.some((r) => r.role === "admin") ?? false;
      const hasPartnerOrAdminRole =
        roles?.some((r) => r.role === "admin" || r.role === "partner") ?? false;

      setIsAdmin(hasAdminRole);
      setCanExportAutoplius(hasPartnerOrAdminRole);
    } catch (error) {
      console.error("Error checking user role:", error);
      scheduleRoleRetry(userId);
    }
  };

  const scheduleRoleRetry = (userId: string) => {
    if (roleRetryTimeoutRef.current) return;
    roleRetryTimeoutRef.current = window.setTimeout(() => {
      roleRetryTimeoutRef.current = null;
      if (userIdRef.current === userId) {
        checkUserRole(userId);
      }
    }, 1500);
  };

  useEffect(() => {
    if (showCreateForm) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showCreateForm]);

  const fetchCars = useCallback(async () => {
    if (!user?.id) return;
    try {
      const query = supabase
        .from("cars")
        .select(`
          id, make, model, year, price, mileage, fuel_type, transmission, 
          image_url, visible_web, visible_autoplius, visible_autolizingas, description, body_type,
          engine_capacity, power_kw, doors, seats, color, steering_wheel,
          condition, vin, defects, features, is_company_car, is_featured, 
          is_recommended, is_reserved, is_sold, euro_standard, fuel_cons_urban, fuel_cons_highway,
          fuel_cons_combined, origin_country, wheel_drive, co2_emission, city
        `)
        .order("created_at", { ascending: false });

      // Admin sees all cars, partner sees only their own
      if (!isAdmin) {
        query.eq("partner_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCars(data || []);
    } catch (error: any) {
      const now = Date.now();
      if (now - (lastCarsErrorAtRef.current || 0) > 4000) {
        lastCarsErrorAtRef.current = now;
        toast.error("Klaida užkraunant skelbimus");
      }
    }
  }, [user?.id, isAdmin]);

  useEffect(() => {
    if (user) {
      fetchCars();
    }
  }, [user, isAdmin, fetchCars]);

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį skelbimą?")) return;

    try {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Skelbimas ištrintas");
      fetchCars();
    } catch (error: any) {
      toast.error("Klaida trinant skelbimą");
    }
  };

  const handleDuplicate = async (car: Car) => {
    try {
      const { id, ...carData } = car;
      const { data: newCar, error } = await supabase
        .from("cars")
        .insert({
          ...carData,
          partner_id: user?.id,
          visible_web: false,
          visible_autoplius: false,
        })
        .select()
        .single();

      if (error) throw error;

      const { data: images } = await supabase
        .from("car_images")
        .select("*")
        .eq("car_id", car.id);

      if (images && images.length > 0) {
        const newImages = images.map(img => ({
          car_id: newCar.id,
          image_url: img.image_url,
          display_order: img.display_order,
        }));

        await supabase.from("car_images").insert(newImages);
      }

      toast.success("Skelbimas nukopijuotas!");
      setEditingCar(newCar);
      setShowCreateForm(true);
      fetchCars();
    } catch (error: any) {
      console.error("Duplicate error:", error);
      toast.error("Klaida kopijuojant skelbimą");
    }
  };


  const filteredCars = useMemo(() => {
    let filtered = [...cars];
    
    // Status filter
    switch (statusFilter) {
      case "active":
        filtered = filtered.filter(c => !c.is_sold && !c.is_reserved);
        break;
      case "reserved":
        filtered = filtered.filter(c => c.is_reserved && !c.is_sold);
        break;
      case "sold":
        filtered = filtered.filter(c => c.is_sold);
        break;
      case "draft":
        filtered = filtered.filter(c => !c.visible_web && !c.visible_autoplius && !c.is_sold);
        break;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(car =>
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.year.toString().includes(query)
      );
    }

    return filtered;
  }, [cars, searchQuery, statusFilter]);

  const { webVisibleCount, autopliusVisibleCount, soldCount, reservedCount } = useMemo(() => ({
    webVisibleCount: cars.filter(c => c.visible_web).length,
    autopliusVisibleCount: cars.filter(c => c.visible_autoplius).length,
    soldCount: cars.filter(c => c.is_sold).length,
    reservedCount: cars.filter(c => c.is_reserved && !c.is_sold).length,
  }), [cars]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20"></div>
          <p className="text-muted-foreground">Kraunama...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PartnerSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isAdmin={isAdmin}
      />

      <main
        className={cn(
          "min-h-screen transition-all duration-300 p-4 pt-16 md:p-6 lg:p-8",
          isMobile ? "ml-0" : (sidebarCollapsed ? "ml-16" : "ml-64")
        )}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Sveiki sugrįžę! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Valdykite savo automobilių skelbimus
            </p>
          </div>
          <Button onClick={() => {
            setEditingCar(null);
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Naujas skelbimas
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 sm:mb-8">
          <StatsCards
            totalCars={cars.length}
            webVisible={webVisibleCount}
            autopliusVisible={autopliusVisibleCount}
          />
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <CreateListing
            car={editingCar}
            onClose={() => {
              setShowCreateForm(false);
              setEditingCar(null);
            }}
            onSuccess={() => {
              setShowCreateForm(false);
              setEditingCar(null);
              fetchCars();
            }}
            isAdmin={isAdmin}
            canExportAutoplius={canExportAutoplius}
          />
        )}

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ieškoti pagal markę, modelį..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Rasta: {filteredCars.length} skelbimų
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredCars.map((car) => (
            <CarListingCard
              key={car.id}
              car={car}
              onEdit={() => {
                setEditingCar(car);
                setShowCreateForm(true);
              }}
              onDelete={() => handleDelete(car.id)}
              onDuplicate={() => handleDuplicate(car)}
              onRefresh={fetchCars}
            />
          ))}
        </div>

        {filteredCars.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? "Nieko nerasta" : "Dar neturite skelbimų"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Pabandykite kitą paieškos užklausą"
                  : "Pradėkite nuo pirmo skelbimo sukūrimo!"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => {
                  setEditingCar(null);
                  setShowCreateForm(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Sukurti pirmą skelbimą
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PartnerDashboard;
