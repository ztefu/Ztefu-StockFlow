"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils/cn";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-surface shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute right-4 top-4">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-full overflow-y-auto">
          {/* We're rendering the Sidebar content here but overriding its fixed classes by passing a wrapper or just duplicating for simplicity.
             Wait, Sidebar component has "w-64 bg-surface ... fixed left-0 top-0". 
             Let's modify Sidebar to accept a className to override "fixed" if needed, or we just render Sidebar and it will be fixed inside our fixed container, which is fine but redundant. 
             Actually, let's modify Sidebar slightly to accept className. */}
          <Sidebar className="relative border-r-0 w-full" onClose={() => setIsOpen(false)} />
        </div>
      </div>
    </>
  );
}
