import { createClient } from "@/lib/supabase/server";
import Settings from "@/components/Settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The same name the Track page greets with: the Google account's, or
  // whatever the user typed here. Never an email prefix.
  const fullName = user?.user_metadata?.full_name as string | undefined;

  return (
    <Settings
      email={user?.email ?? ""}
      name={fullName?.trim() ? fullName : null}
      userId={user!.id}
    />
  );
}
