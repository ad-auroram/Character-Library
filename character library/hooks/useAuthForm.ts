'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';

/**
 * Shared hook for auth form submission (SignIn/SignUp)
 */
export function useAuthForm(
  authMethod: 'signIn' | 'signUp',
  redirectPath: string = '/dashboard'
) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);

      try {
        const supabase = createSupabaseClient();
        const { error: authError } =
          authMethod === 'signIn'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (authError) throw authError;

        router.push(redirectPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [authMethod, redirectPath, router]
  );

  return { error, loading, handleSubmit };
}
