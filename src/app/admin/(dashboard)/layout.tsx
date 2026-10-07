import { requireSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Checked against the database, so the menu reflects the user's current role.
  const session = await requireSession("TECHNICAL");

  return (
    <AdminShell
      user={{ name: session.name, email: session.email, role: session.role }}
    >
      {children}
    </AdminShell>
  );
}
