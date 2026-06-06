import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface ShardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "sm" | "flat";
  blob?: "blue" | "pink" | "purple" | "teal" | null;
}

export function Shard({ className, variant = "default", blob, children, ...props }: ShardProps) {
  return (
    <div
      className={cn("shard", variant === "sm" && "shard-sm", className)}
      {...props}
    >
      {blob && (
        <div
          className="accent-blob"
          style={{
            background:
              blob === "pink"   ? "linear-gradient(135deg,#ff7eb3,#ffb3d0)" :
              blob === "purple" ? "linear-gradient(135deg,#8A2BE2,#c084fc)" :
              blob === "teal"   ? "linear-gradient(135deg,#4ECDC4,#a8efeb)" :
                                  "linear-gradient(135deg,#4e73df,#a8c0ff)",
            bottom: "-20px",
            right: "-20px",
          }}
        />
      )}
      {children}
    </div>
  );
}
