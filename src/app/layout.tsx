import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/layout/Header";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#FF6B35',
};

export const metadata: Metadata = {
  title: {
    default: "Sotobe Eats | Premium Food Delivery",
    template: "%s | Sotobe Eats",
  },
  description: "Experience the future of dining. Premium restaurants delivered to your doorstep.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: "Sotobe Eats | Premium Food Delivery",
    description: "Experience the future of dining. Premium restaurants delivered to your doorstep.",
    url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    siteName: "Sotobe Eats",
    locale: "en_US",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sotobe Eats",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider session={session}>
          <CartProvider>
            <ThemeProvider>
              <Header session={session} key={session?.user?.email || 'guest'} />
              {children}
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
