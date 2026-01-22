import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
}

interface CarCommentsPanelProps {
  carId: string;
  carTitle: string;
}

export function CarCommentsPanel({ carId, carTitle }: CarCommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [carId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("car_comments")
        .select("*")
        .eq("car_id", carId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each comment
      const commentsWithUsers = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", comment.user_id)
            .single();
          
          return {
            ...comment,
            user_email: profile?.email,
            user_name: profile?.full_name,
          };
        })
      );

      setComments(commentsWithUsers);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Įveskite komentarą");
      return;
    }

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Turite būti prisijungęs");
        return;
      }

      const { error } = await supabase.from("car_comments").insert({
        car_id: carId,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      toast.success("Komentaras pridėtas");
      setNewComment("");
      fetchComments();
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error("Klaida pridedant komentarą");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį komentarą?")) return;

    try {
      const { error } = await supabase
        .from("car_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast.success("Komentaras ištrintas");
      fetchComments();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error("Klaida trinant komentarą");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Komentarai / Atnaujinimai
        </CardTitle>
        <p className="text-sm text-muted-foreground">{carTitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add comment form */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Rašykite komentarą ar atnaujinimą..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <Button 
          onClick={handleAddComment} 
          disabled={isSending || !newComment.trim()}
          className="w-full"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Pridėti komentarą
        </Button>

        <Separator />

        {/* Comments list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Dar nėra komentarų</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-muted/50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">
                          {comment.user_name || "Nežinomas"}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {format(new Date(comment.created_at), "MMM d, HH:mm", { locale: lt })}
                        </span>
                      </div>
                    </div>
                    {currentUserId === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap pl-9">{comment.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
