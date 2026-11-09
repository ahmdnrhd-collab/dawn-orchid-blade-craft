import { createFileRoute } from "@tanstack/react-router";
import { Scoreboard } from "@/components/board/scoreboard";
import { getBoard } from "@/lib/medal/server";

export const Route = createFileRoute("/")({
  loader: () => getBoard({ data: { t: 0 } }),
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Papan medali langsung POR SD Kecamatan Benjeng 2026. Peringkat dihitung dari medali emas.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  return <Scoreboard initial={initial} />;
}
