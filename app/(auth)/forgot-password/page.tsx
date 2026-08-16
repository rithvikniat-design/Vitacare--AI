import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity } from "lucide-react";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  const requestReset = async (formData: FormData) => {
    "use server";
    
    const origin = (await headers()).get("origin");
    const email = formData.get("email") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
    });

    if (error) {
      return redirect("/forgot-password?message=Could not send reset password link");
    }

    return redirect("/login?message=Check your email for the reset password link");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md p-8 bg-background border border-border shadow-sm rounded-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="flex flex-col gap-4" action={requestReset}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input name="email" placeholder="you@example.com" required />
          </div>
          
          <Button className="w-full mt-2" type="submit">
            Send Reset Link
          </Button>
          
          {message && (
            <p className="mt-4 p-4 bg-destructive/10 text-destructive text-sm text-center rounded-md">
              {message}
            </p>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Remembered your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
