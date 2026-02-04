import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Globalus scroll-to-top per kiekvieną route pasikeitimą.
 * Vartotojo lūkestis: paspaudus skelbimą / perėjus į kitą puslapį – visada viršus.
 */
export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Use rAF to ensure it runs after React commits the new screen.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  }, [location.pathname, location.search]);

  return null;
}
