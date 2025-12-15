import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InvoiceData, InvoiceItem, InvoiceType, CarDetails } from "@/components/InvoiceForm";

export interface SavedInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  buyer_name: string;
  buyer_company_code: string;
  buyer_vat_code: string | null;
  buyer_address: string;
  buyer_is_company: boolean;
  items: InvoiceItem[];
  total_amount: number;
  note: string | null;
  created_at: string;
  invoice_type: InvoiceType;
  car_vin: string | null;
  car_plate: string | null;
  car_mileage: number | null;
  car_notes: string | null;
  car_make: string | null;
  car_model: string | null;
  attachments: string[];
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState<number>(0);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const parsedInvoices = (data || []).map((inv: Record<string, unknown>) => ({
        id: inv.id as string,
        invoice_number: inv.invoice_number as string,
        invoice_date: inv.invoice_date as string,
        buyer_name: inv.buyer_name as string,
        buyer_company_code: inv.buyer_company_code as string,
        buyer_vat_code: inv.buyer_vat_code as string | null,
        buyer_address: inv.buyer_address as string,
        buyer_is_company: (inv.buyer_is_company as boolean) ?? true,
        items: inv.items as unknown as InvoiceItem[],
        total_amount: inv.total_amount as number,
        note: inv.note as string | null,
        created_at: inv.created_at as string,
        invoice_type: (inv.invoice_type as InvoiceType) || "commission",
        car_vin: inv.car_vin as string | null,
        car_plate: inv.car_plate as string | null,
        car_mileage: inv.car_mileage as number | null,
        car_notes: inv.car_notes as string | null,
        car_make: inv.car_make as string | null,
        car_model: inv.car_model as string | null,
        attachments: (inv.attachments as unknown as string[]) || [],
      }));

      setInvoices(parsedInvoices);

      if (parsedInvoices.length > 0) {
        const numbers = parsedInvoices
          .map((inv) => parseInt(inv.invoice_number, 10))
          .filter((n) => !isNaN(n));
        if (numbers.length > 0) {
          setLastInvoiceNumber(Math.max(...numbers));
        }
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Klaida kraunant sąskaitas");
    } finally {
      setLoading(false);
    }
  };

  const saveInvoice = async (data: InvoiceData): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Turite būti prisijungęs!");
        return false;
      }

      const total = data.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const { error } = await supabase.from("invoices").insert([
        {
          user_id: user.id,
          invoice_number: data.invoiceNumber,
          invoice_date: data.date,
          buyer_name: data.buyer.name,
          buyer_company_code: data.buyer.companyCode,
          buyer_vat_code: data.buyer.vatCode || null,
          buyer_address: data.buyer.address,
          buyer_is_company: data.buyer.isCompany,
          items: JSON.parse(JSON.stringify(data.items)),
          total_amount: total,
          note: data.note || null,
          invoice_type: data.invoiceType,
          car_vin: data.carDetails?.vin || null,
          car_plate: data.carDetails?.plate || null,
          car_mileage: data.carDetails?.mileage ? parseInt(data.carDetails.mileage) : null,
          car_notes: data.carDetails?.notes || null,
          car_make: data.carDetails?.make || null,
          car_model: data.carDetails?.model || null,
          attachments: data.attachments || [],
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast.error(`Sąskaita Nr. ${data.invoiceNumber} jau egzistuoja!`);
        } else {
          throw error;
        }
        return false;
      }

      toast.success("Sąskaita išsaugota!");
      fetchInvoices();
      return true;
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Klaida saugant sąskaitą");
      return false;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;

      toast.success("Sąskaita ištrinta");
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Klaida trinant sąskaitą");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    lastInvoiceNumber,
    saveInvoice,
    deleteInvoice,
    refetch: fetchInvoices,
  };
};
