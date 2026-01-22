import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, X, Loader2, Users, Shield } from "lucide-react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";

interface AccessUser {
  id: string;
  user_id: string;
  granted_by: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  granted_by_name?: string;
}

interface CarAccessPanelProps {
  carId: string;
  carTitle: string;
  isOwner: boolean;
}

export function CarAccessPanel({ carId, carTitle, isOwner }: CarAccessPanelProps) {
  const [accessList, setAccessList] = useState<AccessUser[]>([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    fetchAccessList();
  }, [carId]);

  const fetchAccessList = async () => {
    try {
      const { data, error } = await supabase
        .from("car_access")
        .select("*")
        .eq("car_id", carId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const accessWithUsers = await Promise.all(
        (data || []).map(async (access) => {
          const [userProfile, grantedByProfile] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", access.user_id)
              .single(),
            supabase
              .from("profiles")
              .select("full_name")
              .eq("id", access.granted_by)
              .single(),
          ]);

          return {
            ...access,
            user_email: userProfile.data?.email,
            user_name: userProfile.data?.full_name,
            granted_by_name: grantedByProfile.data?.full_name,
          };
        })
      );

      setAccessList(accessWithUsers);
    } catch (error) {
      console.error("Error fetching access list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!email.trim()) {
      toast.error("Įveskite el. pašto adresą");
      return;
    }

    setIsGranting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Turite būti prisijungęs");
        return;
      }

      // Find user by email
      const { data: targetProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (profileError || !targetProfile) {
        toast.error("Vartotojas su šiuo el. paštu nerastas");
        return;
      }

      if (targetProfile.id === user.id) {
        toast.error("Negalite suteikti prieigos sau");
        return;
      }

      // Check if already has access
      const { data: existingAccess } = await supabase
        .from("car_access")
        .select("id")
        .eq("car_id", carId)
        .eq("user_id", targetProfile.id)
        .single();

      if (existingAccess) {
        toast.error("Šis vartotojas jau turi prieigą");
        return;
      }

      const { error } = await supabase.from("car_access").insert({
        car_id: carId,
        user_id: targetProfile.id,
        granted_by: user.id,
      });

      if (error) throw error;

      toast.success("Prieiga suteikta");
      setEmail("");
      fetchAccessList();
    } catch (error: any) {
      console.error("Error granting access:", error);
      toast.error("Klaida suteikiant prieigą");
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    if (!confirm("Ar tikrai norite atšaukti prieigą?")) return;

    try {
      const { error } = await supabase
        .from("car_access")
        .delete()
        .eq("id", accessId);

      if (error) throw error;

      toast.success("Prieiga atšaukta");
      fetchAccessList();
    } catch (error: any) {
      console.error("Error revoking access:", error);
      toast.error("Klaida atšaukiant prieigą");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Prieigos valdymas
        </CardTitle>
        <p className="text-sm text-muted-foreground">{carTitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grant access form - only for owner */}
        {isOwner && (
          <div className="flex gap-2">
            <Input
              placeholder="Vartotojo el. paštas"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <Button onClick={handleGrantAccess} disabled={isGranting}>
              {isGranting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Access list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : accessList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Dar niekas neturi prieigos</p>
            {isOwner && (
              <p className="text-xs mt-1">Pridėkite vartotojus pagal el. paštą</p>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {accessList.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {access.user_name || access.user_email}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Prieiga
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Suteikė: {access.granted_by_name} • {format(new Date(access.created_at), "MMM d", { locale: lt })}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevokeAccess(access.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
