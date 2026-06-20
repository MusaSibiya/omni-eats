'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

const TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

export function SessionTimeout() {
  const { data: session, status } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (status === 'authenticated') {
      timeoutRef.current = setTimeout(handleTimeout, TIMEOUT);
    }
  };

  const handleTimeout = async () => {
    setShowMessage(true);
    await signOut({ callbackUrl: '/login?timeout=true' });
  };

  useEffect(() => {
    if (status === 'authenticated') {
      // Reset timeout on user activity
      const activityEvents = [
        'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'
      ];
      
      activityEvents.forEach(event => {
        window.addEventListener(event, resetTimeout, { passive: true });
      });
      
      resetTimeout(); // Start the timeout

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
