'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function AuthErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      toast({
        variant: 'destructive',
        title: 'Sessão Expirada',
        description: customEvent.detail.message,
      });
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [toast]);

  return null;
}
