import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Activity className="w-10 h-10 text-primary animate-pulse" />
    </div>
  );
}
