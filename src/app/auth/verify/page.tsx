import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    }>
      <VerifyClient />
    </Suspense>
  );
}
