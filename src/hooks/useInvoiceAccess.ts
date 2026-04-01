import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useInvoiceAccess() {
  const [hasInvoiceAccess, setHasInvoiceAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasInvoiceAccess(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("invoice_access" as any)
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        setHasInvoiceAccess(!!data && !error);
      } catch {
        setHasInvoiceAccess(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  return { hasInvoiceAccess, loading };
}
