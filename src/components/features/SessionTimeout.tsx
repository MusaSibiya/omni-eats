'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

const TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

export function SessionTimeout() {
  const { status } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (status === 'authenticated') {
      timeoutRef.current = setTimeout(handleTimeout, TIMEOUT);
    }
  };

  const handleTimeout = async () => {
    await signOut({ callbackUrl: '/login?timeout=true' });
  };

  useEffect(() => {
    // Only setup listeners if authenticated
    if (status === 'authenticated') {
      const activityEvents = [
        'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'
      ];
      
      activityEvents.forEach(event => {
        window.addEventListener(event, resetTimeout, { passive: true });
      });
      
      resetTimeout(); // Start the initial timeout

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        activityEvents.forEach(event => {
          window.removeEventListener(event, resetTimeout);
        });
      };
    }
  }, [status]);

  // Don't render anything, this is just for tracking!
  return null;
}
