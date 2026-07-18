import { SettingsClient } from "./SettingsClient";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  return <SettingsClient initialSettings={settings} />;
}
