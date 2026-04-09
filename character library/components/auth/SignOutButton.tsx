'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

interface SignOutButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function SignOutButton({ variant = 'danger' }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button variant={variant} onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
