'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

interface SignOutButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function SignOutButton({ variant = 'danger' }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant={variant} loading={loading} onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
