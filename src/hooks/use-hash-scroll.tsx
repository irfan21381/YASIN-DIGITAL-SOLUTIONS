"use client";

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useHashScroll() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // Use setTimeout to ensure the element is rendered and the layout is stable
        // before attempting to scroll. This is especially useful with React Router
        // and dynamic content.
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // A small delay
      }
    } else {
      // If no hash, scroll to top of the page or main content area
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);
}