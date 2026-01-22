import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarCommentsPanel } from "./CarCommentsPanel";
import { CarAccessPanel } from "./CarAccessPanel";
import { MessageSquare, Shield } from "lucide-react";

interface CarManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  carTitle: string;
  isOwner: boolean;
}

export function CarManagementDialog({
  open,
  onOpenChange,
  carId,
  carTitle,
  isOwner,
}: CarManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{carTitle}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Komentarai
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Prieiga
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments" className="mt-4">
            <CarCommentsPanel carId={carId} carTitle={carTitle} />
          </TabsContent>
          
          <TabsContent value="access" className="mt-4">
            <CarAccessPanel carId={carId} carTitle={carTitle} isOwner={isOwner} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
