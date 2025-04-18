// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppUtilsProvider } from "@/context/AppUtils";
import ProtectedRoute from "@/context/ProtectedRoutes";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin Panel",
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