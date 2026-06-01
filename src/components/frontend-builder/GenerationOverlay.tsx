import { useEffect, useState } from "react";
import { Code2, Layout, Palette, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LINES = [
  "Analyzing your vision…",
  "Crafting layout structure…",
  "Styling components & typography…",
  "Polishing responsive design…",
  "Almost there…",
];

interface GenerationOverlayProps {
  message?: string;
}

export function GenerationOverlay({
  message = "Building your website",
}: GenerationOverlayProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/95 backdrop-blur-md">
      <div className="fb-gen-orb fb-gen-orb-1" aria-hidden />
      <div className="fb-gen-orb fb-gen-orb-2" aria-hidden />
      <div className="fb-gen-orb fb-gen-orb-3" aria-hidden />
      <div className="fb-gen-grid absolute inset-0 opacity-30" aria-hidden />

      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-lg">
        <div className="relative mb-8">
          <div className="fb-gen-ring fb-gen-ring-outer" />
          <div className="fb-gen-ring fb-gen-ring-inner" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 shadow-[0_0_60px_hsl(168_80%_50%/0.35)]">
            <Sparkles className="h-14 w-14 text-primary fb-gen-pulse-icon" />
          </div>
          <Wand2 className="absolute -right-4 -top-2 h-8 w-8 text-primary/70 fb-gen-float" />
          <Layout className="absolute -left-5 bottom-0 h-7 w-7 text-sky-400/80 fb-gen-float-delayed" />
          <Palette className="absolute -bottom-4 right-2 h-7 w-7 text-emerald-400/80 fb-gen-float-slow" />
          <Code2 className="absolute left-1/2 -top-6 h-6 w-6 -translate-x-1/2 text-primary/60 fb-gen-float" />
        </div>

        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl gradient-text">
          {message}
        </h3>
        <p
          key={statusIndex}
          className="mt-3 text-sm text-muted-foreground fb-gen-status-fade sm:text-base"
        >
          {STATUS_LINES[statusIndex]}
        </p>

        <div className="mt-8 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full bg-primary",
                "fb-gen-dot",
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <div className="mt-10 w-full max-w-xs h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-primary fb-gen-progress" />
        </div>
      </div>
    </div>
  );
}
