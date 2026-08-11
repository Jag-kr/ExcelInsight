import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // A travelling sheen rather than a whole-block opacity pulse: it reads as
  // "content loading here" instead of "this element is disabled", and several
  // skeletons side by side no longer blink in unison.
  return <div className={cn("skeleton-sheen rounded-md", className)} {...props} />;
}

export { Skeleton };
