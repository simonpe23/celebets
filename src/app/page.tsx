import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-dvh flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-md">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Celebets</h1>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
            >
              Log out
            </button>
          </form>
        </header>

        <div className="mt-10 rounded-2xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-500">You are logged in as</p>
          <p className="mt-1 break-all font-semibold">{user?.email}</p>
          <p className="mt-4 text-sm text-neutral-500">
            Phase 1 complete. The wallet and bet form arrive in Phase 2.
          </p>
        </div>
      </div>
    </main>
  );
}
