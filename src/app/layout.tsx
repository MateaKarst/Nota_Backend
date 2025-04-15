import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppUtilsProvider } from "@/context/AppUtils";
import ProtectedRoute from "@/context/ProtectedRoutes";

import "adminbsb-materialdesign/plugins/bootstrap/css/bootstrap.css";
import "materialize-css/dist/css/materialize.min.css";


export const metadata: Metadata = {
  title: "ACES Learning Hub",
  description: "ACES Learning Hub Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppUtilsProvider>
          <ProtectedRoute>{children}</ProtectedRoute>
        </AppUtilsProvider>
      </body>
    </html>
  );
}
