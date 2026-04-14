'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthForm } from '@/hooks/useAuthForm';
import { Alert } from '@/components/ui/Alert';
import { AuthInput } from '@/components/auth/AuthInput';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, loading, handleSubmit } = useAuthForm('signIn');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(email, password);
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-8 py-10 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Sign In
      </h1>

      <form onSubmit={handleSignIn} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
