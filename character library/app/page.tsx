import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/dashboard" : "/signin";
  const ctaLabel = user ? "Go to Dashboard" : "Sign In";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 w-full max-w-2xl">
          <div className="flex flex-col items-center gap-8 text-center">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={150}
              height={30}
              priority
            />
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome to Supabase Starter
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                A full-stack Next.js application with Supabase authentication, 
                protected routes, and a complete development setup.
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                {user ? "You're signed in, let's go!" : "Sign in here!"}
              </p>
              <Link
                href={ctaHref}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
              >
                {ctaLabel}
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 w-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    🔐 Authentication
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Built-in sign up, sign in, and session management
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    🛡️ Protected Routes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Middleware-based route protection
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    💾 Database Ready
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    PostgreSQL with migrations and RLS
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    ⚡ TypeScript
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fully typed with custom hooks and utilities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
