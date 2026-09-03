import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { adminTheme } from "@/components/admin/theme";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Choir Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <div className="admin-root">{children}</div>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
