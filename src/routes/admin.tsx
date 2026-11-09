import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/board/admin-dashboard";
import { getBoard } from "@/lib/medal/server";

export const Route = createFileRoute("/admin")({
  loader: () => getBoard({ data: { t: 0 } }),
  head: () => ({
    meta: [{ title: "Panel Panitia — Live Medal Standing" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const initial = Route.useLoaderData();
  return <AdminDashboard initial={initial} />;
}
