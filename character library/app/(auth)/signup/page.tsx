'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthForm } from '@/hooks/useAuthForm';
import { Alert } from '@/components/ui/Alert';
import { AuthInput } from '@/components/auth/AuthInput';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, loading, handleSubmit } = useAuthForm('signUp');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(email, password);
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-8 py-10 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Create Account
      </h1>

      <form onSubmit={handleSignUp} className="space-y-4">
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
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/signin" className="text-emerald-600 dark:text-emerald-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
