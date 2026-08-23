import type { Database } from "@/types/supabase";

type Genre = Database["public"]["Tables"]["genres"]["Row"];

type HomeViewProps = {
  data: Genre[] | null;
  error: { message: string } | null;
};

export function HomeView({ data, error }: HomeViewProps) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1>Stuff goes here</h1>
        <pre className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {error ? `Error: ${error.message}` : JSON.stringify(data, null, 2)}
        </pre>
      </main>
    </div>
  );
}
