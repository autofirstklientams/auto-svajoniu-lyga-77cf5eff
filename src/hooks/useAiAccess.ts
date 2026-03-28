import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAiAccess() {
  const [hasAiAccess, setHasAiAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasAiAccess(false);
          setLoading(false);
          return;
        }

        // Check if user has ai_feature_access record
        const { data, error } = await supabase
          .from("ai_feature_access" as any)
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        setHasAiAccess(!!data && !error);
      } catch {
        setHasAiAccess(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  return { hasAiAccess, loading };
}
