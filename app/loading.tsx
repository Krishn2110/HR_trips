import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Spinner Container */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing outer circle */}
          <div className="absolute w-20 h-20 rounded-full border-4 border-primary/10 animate-ping duration-1000" />
          {/* Spinning loader */}
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          {/* Logo center */}
          <div className="absolute font-heading font-black text-base text-primary">
            HR
          </div>
        </div>

        {/* Text */}
        <div className="mt-2">
          <h3 className="font-heading font-bold text-ink text-lg tracking-wide animate-pulse">
            Loading Adventure
          </h3>
          <p className="text-muted text-xs mt-0.5">
            Preparing your travel experience...
          </p>
        </div>
      </div>
    </div>
  );
}
