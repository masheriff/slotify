
// components/ui/global-loading.tsx
'use client';

import { useLoadingStore } from "@/stores/loading-store";
import { useEffect, useState } from "react";

export function GlobalLoadingIndicator() {
  const hasAnyLoading = useLoadingStore(state => 
    Object.values(state.loadingStates).some(s => s.isLoading)
  );
  
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasAnyLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress animation
      const timer1 = setTimeout(() => setProgress(30), 100);
      const timer2 = setTimeout(() => setProgress(60), 300);
      const timer3 = setTimeout(() => setProgress(85), 800);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // Complete the animation when loading stops
      setProgress(100);
      
      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
      
      return () => clearTimeout(hideTimer);
    }
  }, [hasAnyLoading]);

  if (!isVisible) return null;

  return (
    <>
      {/* Loading bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-neutral-500 to-neutral-600 transition-all duration-300 ease-out"
          style={{ 
            width: `${progress}%`,
            boxShadow: progress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
          }}
        />
      </div>
      
      {/* Optional: Loading message overlay */}
      {/* {hasAnyLoading && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-white/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-700">Processing...</span>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}