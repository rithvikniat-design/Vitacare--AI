import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <Activity className="w-10 h-10" />
      </div>
      <h2 className="text-4xl font-bold text-foreground mb-4">404 - Not Found</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. Let's get you back to the clinic.
      </p>
      <Link href="/">
        <Button size="lg">Return to Home</Button>
      </Link>
    </div>
  );
}
