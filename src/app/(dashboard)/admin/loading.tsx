import { Logo } from "@/components/ui/logo";

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-bounce">
          <Logo size="lg" />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white animate-pulse mt-2">
          Chargement en cours...
        </p>
      </div>
    </div>
  )
}
