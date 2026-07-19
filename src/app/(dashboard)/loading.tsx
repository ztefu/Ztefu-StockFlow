export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement en cours...</p>
      </div>
    </div>
  )
}
