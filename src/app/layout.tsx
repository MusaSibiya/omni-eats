import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "Omni Eats | Premium Food Delivery",
    template: "%s | Omni Eats",
  },
  description: "Experience the future of dining. Premium restaurants delivered to your doorstep.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: "Omni Eats | Premium Food Delivery",
    description: "Experience the future of dining. Premium restaurants delivered to your doorstep.",
    url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    siteName: "Omni Eats",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <Header />
              {children}
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
