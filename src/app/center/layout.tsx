import type { Metadata } from "next";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: "DharaSetu Center",
  description: "DharaSetu Center Dashboard - Farmer onboarding and wallet management for CSC operators",
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function CenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider storageKey="dharasetu_center">
      {children}
    </AuthProvider>
  );
}
