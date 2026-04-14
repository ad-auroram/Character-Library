import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out on server:', error);
  }

  const redirectUrl = new URL('/', request.url);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
