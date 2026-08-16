import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity } from "lucide-react";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  const resetPassword = async (formData: FormData) => {
    "use server";
    
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return redirect("/reset-password?message=Passwords do not match");
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return redirect("/reset-password?message=Could not update password");
    }

    return redirect("/login?message=Password updated successfully");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md p-8 bg-background border border-border shadow-sm rounded-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password</p>
        </div>

        <form className="flex flex-col gap-4" action={resetPassword}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              New Password
            </label>
            <Input type="password" name="password" placeholder="••••••••" required minLength={6} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <Input type="password" name="confirmPassword" placeholder="••••••••" required minLength={6} />
          </div>
          
          <Button className="w-full mt-2" type="submit">
            Update Password
          </Button>
          
          {message && (
            <p className="mt-4 p-4 bg-destructive/10 text-destructive text-sm text-center rounded-md">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
