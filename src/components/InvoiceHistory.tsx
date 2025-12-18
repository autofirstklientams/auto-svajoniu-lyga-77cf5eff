import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Trash2, FileText, Loader2, Upload, Download, ExternalLink, Check } from "lucide-react";
import { SavedInvoice } from "@/hooks/useInvoices";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadedInvoice {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

interface InvoiceHistoryProps {
  invoices: SavedInvoice[];
  loading: boolean;
  onView: (invoice: SavedInvoice) => void;
  onDelete: (id: string) => void;
  onTogglePaid?: (id: string, isPaid: boolean) => void;
  onRefresh?: () => void;
}

const InvoiceHistory = ({ invoices, loading, onView, onDelete, onTogglePaid, onRefresh }: InvoiceHistoryProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedInvoices, setUploadedInvoices] = useState<UploadedInvoice[]>([]);
  const [loadingUploaded, setLoadingUploaded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUploadedInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedInvoices(data || []);
    } catch (error) {
      console.error("Error fetching uploaded invoices:", error);
    } finally {
      setLoadingUploaded(false);
    }
  };

  useEffect(() => {
    fetchUploadedInvoices();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Netinkamas failo formatas. Leidžiami: PDF, JPG, PNG, WEBP");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Prašome prisijungti");
        return;
      }

      const fileName = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the file path (not public URL since bucket is now private)
      const filePath = fileName;

      const { error: dbError } = await supabase
        .from('uploaded_invoices')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: filePath, // Store path, not public URL
          file_type: file.type,
        });

      if (dbError) throw dbError;

      toast.success("Sąskaita įkelta sėkmingai!");
      fetchUploadedInvoices();
      onRefresh?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Nepavyko įkelti sąskaitos: " + (error.message || "Klaida"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteUploaded = async (id: string, filePath: string) => {
    if (!confirm("Ar tikrai norite ištrinti šią sąskaitą?")) return;
    
    try {
      // file_url now stores the file path directly (not full URL)
      // Handle both old format (full URL) and new format (path only)
      let pathToDelete = filePath;
      if (filePath.includes('/invoices/')) {
        const urlParts = filePath.split('/invoices/');
        pathToDelete = urlParts[urlParts.length - 1];
      }
      
      await supabase.storage.from('invoices').remove([pathToDelete]);

      const { error } = await supabase
        .from('uploaded_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Sąskaita ištrinta");
      fetchUploadedInvoices();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Nepavyko ištrinti: " + (error.message || "Klaida"));
    }
  };

  // Handle opening uploaded invoice with signed URL
  const handleOpenUploaded = async (filePath: string) => {
    try {
      // Handle both old format (full URL) and new format (path only)
      let pathToSign = filePath;
      if (filePath.includes('/invoices/')) {
        const urlParts = filePath.split('/invoices/');
        pathToSign = urlParts[urlParts.length - 1];
      } else if (filePath.startsWith('http')) {
        // Old public URL format - try to extract path
        const match = filePath.match(/\/invoices\/(.+)$/);
        if (match) pathToSign = match[1];
      }
      
      const { data, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(pathToSign, 3600); // 1 hour expiry

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error("Error creating signed URL:", error);
      toast.error("Nepavyko atidaryti failo");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("lt-LT");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "car_sale":
        return "Automobilio pardavimas";
      case "service":
        return "Paslaugos";
      default:
        return "Komisinis mokestis";
    }
  };

  if (loading || loadingUploaded) {
    return (
      <Card className="form-section">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Kraunama...</span>
        </CardContent>
      </Card>
    );
  }

  const totalCount = invoices.length + uploadedInvoices.length;

  if (totalCount === 0) {
    return (
      <Card className="form-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sąskaitų istorija
            </CardTitle>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Įkelti sąskaitą
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Dar nėra išsaugotų sąskaitų</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Sukurtos sąskaitos bus rodomos čia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="form-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sąskaitų istorija ({totalCount})
          </CardTitle>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Įkelti sąskaitą
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Generated invoices */}
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                invoice.is_paid 
                  ? "bg-green-500/10 hover:bg-green-500/20 border border-green-500/30" 
                  : "bg-secondary/30 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {onTogglePaid && (
                  <Checkbox
                    checked={invoice.is_paid}
                    onCheckedChange={(checked) => onTogglePaid(invoice.id, checked as boolean)}
                    className="h-5 w-5"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Nr. {invoice.invoice_number}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {getTypeLabel(invoice.invoice_type)}
                    </span>
                    {invoice.is_paid && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Apmokėta
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {invoice.buyer_name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{formatDate(invoice.invoice_date)}</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(invoice)}
                  title="Peržiūrėti"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Ar tikrai norite ištrinti šią sąskaitą?")) {
                      onDelete(invoice.id);
                    }
                  }}
                  title="Ištrinti"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {/* Uploaded invoices */}
          {uploadedInvoices.map((uploaded) => (
            <div
              key={uploaded.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">
                    {uploaded.file_name}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-muted-foreground/20 text-muted-foreground rounded-full">
                    Įkelta
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(uploaded.created_at)}</span>
                  <span>{uploaded.file_type.split('/')[1]?.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenUploaded(uploaded.file_url)}
                  title="Atidaryti"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteUploaded(uploaded.id, uploaded.file_url)}
                  title="Ištrinti"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceHistory;
