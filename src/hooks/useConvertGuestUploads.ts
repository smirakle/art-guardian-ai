import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GUEST_SESSION_KEY = "tsmo_guest_session";

export const useConvertGuestUploads = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const convertUploads = async () => {
      if (!user) return;

      const guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);
      if (!guestSessionId) return;

      try {
        // Call the conversion function
        const { data, error } = await supabase.rpc('convert_guest_uploads_to_user', {
          p_session_id: guestSessionId,
          p_user_id: user.id
        });

        if (error) throw error;

        const count = data as number;
        if (count > 0) {
          toast({
            title: "Uploads Saved!",
            description: `${count} guest upload${count > 1 ? 's' : ''} have been saved to your account.`,
          });

          // Clear guest session
          localStorage.removeItem(GUEST_SESSION_KEY);
        }
      } catch (error: any) {
        console.error('Error converting guest uploads:', error);
      }
    };

    convertUploads();
  }, [user, toast]);
};
