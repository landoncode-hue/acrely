import "@acrely/ui/styles";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pinnacle Builders Portal - Property Management System",
  description: "Building Trust, One Estate at a Time - Official property management platform for Pinnacle Builders Homes & Properties",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Pinnacle Builders Portal",
    description: "Building Trust, One Estate at a Time",
    type: "website",
    url: "https://acrely.pinnaclegroups.ng",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
