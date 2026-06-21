import type { Metadata } from "next";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: "DharaSetu Admin",
  description: "DharaSetu Admin Dashboard - Manage CSC operators, farmers, and payments",
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider storageKey="dharasetu_admin">
      {children}
    </AuthProvider>
  );
}
