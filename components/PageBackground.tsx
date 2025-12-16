'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';

export default function PageBackground({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomePage = pathname === '/';

  // Only apply background after mounting and if not on home page
  const showBackground = mounted && !isHomePage;

  // Always render the EXACT same DOM structure to avoid hydration mismatch
  // Control visibility through CSS classes/styles, not conditional rendering
  return (
    <div
      className="relative min-h-screen w-full"
      style={showBackground ? {
        backgroundImage: 'url(/images/backdrop.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      {/* Overlay - always rendered, visibility controlled by opacity */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          opacity: showBackground ? 1 : 0
        }}
      />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
