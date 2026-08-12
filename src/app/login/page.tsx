import Disclaimer from "@/components/Disclaimer";
import LoginForm from "@/components/LoginForm";
import BackHome from "@/components/BackHome";

// The log in PAGE. It stays alive now that the landing page opens a
// panel instead: emailed links, bookmarks and anyone who already has
// the address keep working. The panel is a faster front door, not a
// replacement.
//
// The form itself lives in LoginForm so this page and the panel share
// one copy of it.
export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
      <BackHome />
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Celebet
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Log in to your account
        </p>

        <LoginForm />

        <Disclaimer />
      </div>
    </main>
  );
}
