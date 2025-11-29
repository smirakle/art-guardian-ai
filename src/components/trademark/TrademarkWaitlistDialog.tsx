import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  company_name: z.string().optional(),
  use_case: z.string().min(10, "Please describe your use case (at least 10 characters)"),
  priority_level: z.enum(["standard", "priority", "enterprise"]),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface TrademarkWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrademarkWaitlistDialog({
  open,
  onOpenChange,
}: TrademarkWaitlistDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: user?.email || "",
      company_name: "",
      use_case: "",
      priority_level: "standard",
    },
  });

  const onSubmit = async (data: WaitlistFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join the waitlist",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("trademark_waitlist").insert({
        user_id: user.id,
        email: data.email,
        company_name: data.company_name || null,
        use_case: data.use_case,
        priority_level: data.priority_level,
        status: "pending",
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Successfully joined waitlist! 🎉",
        description: "We'll notify you when trademark monitoring becomes available.",
      });

      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
        form.reset();
      }, 2000);
    } catch (error: any) {
      console.error("Error joining waitlist:", error);
      toast({
        title: "Error joining waitlist",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                You're on the list!
              </>
            ) : (
              "Join Trademark Monitoring Waitlist"
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "We'll keep you updated on our trademark monitoring launch."
              : "Be among the first to access our comprehensive trademark monitoring system."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Thank you for joining!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check your email for updates.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="use_case"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Case *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us how you plan to use trademark monitoring..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Help us understand your needs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard Access</SelectItem>
                        <SelectItem value="priority">Priority Access</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select your preferred access tier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
