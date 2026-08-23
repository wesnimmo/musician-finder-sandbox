import { HomeView } from "@/components/HomeView";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("genres").select("*");
  console.log({ data, error });

  return <HomeView data={data} error={error} />;
}
