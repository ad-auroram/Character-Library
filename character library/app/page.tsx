import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type FeaturedCharacter = {
  id: string;
  name: string;
  role: string | null;
  summary: string | null;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  updated_at: string;
};

type FeaturedCharacterAvatar = {
  character_id: string;
  image_url: string;
  sort_order: number;
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function statSummary(character: FeaturedCharacter) {
  const stats = [
    character.strength,
    character.dexterity,
    character.constitution,
    character.intelligence,
    character.wisdom,
    character.charisma,
  ];

  const total = stats.reduce((sum, value) => sum + value, 0);
  const highest = Math.max(...stats);
  return `${total} total power · peak ${highest}`;
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: publicCharactersData, error: publicCharactersError } = await supabase
    .from("characters")
    .select("id, name, role, summary, strength, dexterity, constitution, intelligence, wisdom, charisma, updated_at")
    .eq("is_public", true)
    .order("updated_at", { ascending: false });

  if (publicCharactersError) {
    throw new Error(publicCharactersError.message);
  }

  const featuredCharacters = shuffle((publicCharactersData ?? []) as FeaturedCharacter[]).slice(0, 5);
  const featuredCharacterIds = featuredCharacters.map((character) => character.id);
  const { data: avatarRows } = featuredCharacterIds.length
    ? await supabase
        .from("character_images")
        .select("character_id, image_url, sort_order")
        .in("character_id", featuredCharacterIds)
        .order("sort_order", { ascending: true })
    : { data: null };

  const avatarMap = new Map<string, string>();
  for (const row of (avatarRows ?? []) as FeaturedCharacterAvatar[]) {
    if (!avatarMap.has(row.character_id)) {
      avatarMap.set(row.character_id, row.image_url);
    }
  }

  const ctaHref = user ? "/dashboard" : "/signin";
  const ctaLabel = user ? "Go to Dashboard" : "Sign In";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.18),_transparent_28%),linear-gradient(180deg,_#f7fbf7_0%,_#e7f4ea_44%,_#ffffff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#072414_52%,_#0f1f15_100%)] dark:text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <section className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-emerald-200/80 bg-white/75 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-900/60 dark:text-emerald-100">
              Character Library
            </div>

            <div className="max-w-2xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-300">
                Welcome, traveler
              </p>
              <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Build heroes, catalog spells, and keep your party story in one place.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
                This is the living home for your characters, spell lists, bookmarks, and export tools. Sign in to manage your own roster or explore the featured public characters below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={ctaHref}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-500"
              >
                {ctaLabel}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Auth", "Private access for your own roster"],
                ["Spell Library", "Search and add spells by class"],
                ["Exports", "Create PDF sheets with queued jobs"],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/55"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/60">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                  Featured
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Random Public Characters</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {featuredCharacters.length} shown
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {featuredCharacters.length > 0 ? (
                featuredCharacters.map((character) => (
                  <Link
                    key={character.id}
                    href={`/characters/${character.id}`}
                    className="group block rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-emerald-500/50 dark:hover:bg-slate-900"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        {avatarMap.get(character.id) ? (
                          <img
                            src={avatarMap.get(character.id)}
                            alt={`${character.name} avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-lime-700 text-xs font-bold text-white">
                            {character.name
                              .split(" ")
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-slate-900 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                              {character.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {character.role || "No role set"}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                            {statSummary(character)}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {character.summary || "No summary yet."}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No public characters yet. Be the first to share one.
                </div>
              )}
            </div>
          </aside>
        </section>

        <footer className="mt-10 border-t border-slate-200/80 py-8 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">How the site is built and run</p>
              <p className="mt-2 max-w-2xl leading-7">
                Next.js App Router, React, TypeScript, Supabase Auth and Postgres, Tailwind CSS, PDF exports with BullMQ + Redis, and a Railway worker for background jobs. Production app hosting is on Vercel, with Supabase handling data and storage.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Supabase",
                "Tailwind CSS",
                "Vercel",
                "Upstash Redis",
                "Railway Worker",
                "BullMQ",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-300 bg-white/80 px-3 py-2 text-center text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
