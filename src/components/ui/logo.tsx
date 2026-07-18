import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-sm", sizeClasses[size], className)}
    >
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <rect width="40" height="40" rx="10" fill="url(#bg_grad)" fillOpacity="0.3" />
      
      <path d="M20 11L10 16L20 21L30 16L20 11Z" fill="url(#top_grad)" />
      <path d="M10 21L20 26L30 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 26L20 31L30 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      
      <defs>
        <linearGradient id="bg_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="black" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="top_grad" x1="10" y1="11" x2="30" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
