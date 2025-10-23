import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "./Auth";

const PartnerLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Jei jau prisijungęs, nukreipti į dashboard
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/partner-dashboard");
        }
      });
    });
  }, [navigate]);

  return <Auth />;
};

export default PartnerLogin;
