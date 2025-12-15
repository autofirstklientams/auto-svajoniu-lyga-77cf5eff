import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SavedBuyer {
  id: string;
  name: string;
  company_code: string;
  vat_code: string | null;
  address: string;
  is_company: boolean;
}

export interface SavedProduct {
  id: string;
  description: string;
  default_price: number;
}

export interface SavedNote {
  id: string;
  content: string;
}

export const useSavedData = () => {
  const [buyers, setBuyers] = useState<SavedBuyer[]>([]);
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [buyersRes, productsRes, notesRes] = await Promise.all([
        supabase.from("saved_buyers").select("*").order("name"),
        supabase.from("saved_products").select("*").order("description"),
        supabase.from("saved_notes").select("*").order("created_at"),
      ]);

      if (buyersRes.data) setBuyers(buyersRes.data);
      if (productsRes.data) setProducts(productsRes.data.map(p => ({
        ...p,
        default_price: Number(p.default_price) || 0
      })));
      if (notesRes.data) setNotes(notesRes.data.map(n => ({
        id: n.id,
        content: n.content
      })));
    } catch (error) {
      console.error("Error fetching saved data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addBuyer = async (buyer: Omit<SavedBuyer, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Turite būti prisijungęs!");
        return false;
      }
      const { error } = await supabase.from("saved_buyers").insert([{ ...buyer, user_id: user.id }]);
      if (error) throw error;
      toast.success("Pirkėjas išsaugotas!");
      fetchAll();
      return true;
    } catch (error) {
      console.error("Error saving buyer:", error);
      toast.error("Klaida saugant pirkėją");
      return false;
    }
  };

  const deleteBuyer = async (id: string) => {
    try {
      const { error } = await supabase.from("saved_buyers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Pirkėjas ištrintas");
      fetchAll();
    } catch (error) {
      console.error("Error deleting buyer:", error);
      toast.error("Klaida trinant pirkėją");
    }
  };

  const addProduct = async (description: string, defaultPrice: number = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Turite būti prisijungęs!");
        return false;
      }
      const { error } = await supabase.from("saved_products").insert([
        { description, default_price: defaultPrice, user_id: user.id }
      ]);
      if (error) throw error;
      toast.success("Prekė/paslauga išsaugota!");
      fetchAll();
      return true;
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Klaida saugant prekę");
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("saved_products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Prekė ištrinta");
      fetchAll();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Klaida trinant prekę");
    }
  };

  const addNote = async (content: string) => {
    if (!content.trim()) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Turite būti prisijungęs!");
        return false;
      }
      const { error } = await supabase.from("saved_notes").insert([{ content, user_id: user.id }]);
      if (error) {
        if (error.code === "23505") {
          toast.error("Tokia pastaba jau egzistuoja");
        } else {
          throw error;
        }
        return false;
      }
      toast.success("Pastaba išsaugota!");
      fetchAll();
      return true;
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Klaida saugant pastabą");
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from("saved_notes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Pastaba ištrinta");
      fetchAll();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Klaida trinant pastabą");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    buyers,
    products,
    notes,
    loading,
    addBuyer,
    deleteBuyer,
    addProduct,
    deleteProduct,
    addNote,
    deleteNote,
    refetch: fetchAll,
  };
};
