import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "red";
}

export function Logo({ className, size = "md", color = "primary" }: LogoProps) {
  const sizeClasses = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const dimension = sizeClasses[size];

  // Filtre CSS pour tourner la teinte (bleu vers rouge) tout en préservant le blanc de l'icône
  const redFilter = "hue-rotate(140deg) saturate(150%) brightness(110%)";

  return (
    <div 
      className={cn("relative shrink-0 flex items-center justify-center drop-shadow-sm", className)}
      style={{ 
        width: dimension, 
        height: dimension,
        filter: color === "red" ? redFilter : "none",
        transition: "filter 0.3s ease"
      }}
    >
      <Image 
        src="/logo.png" 
        alt="StockFlow AF" 
        width={dimension} 
        height={dimension}
        className="object-contain mix-blend-multiply dark:mix-blend-screen dark:invert dark:hue-rotate-180"
        priority
      />
    </div>
  );
}
