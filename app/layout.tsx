import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kassie's Patterns",
  description: "Patterns for Kassie Baking",
  icons: {icon: '/crochet.ico'}
};

// Dark by default (homeauto style); only opt out if user chose light
const themeScript = `if (localStorage.getItem('theme') !== 'light') document.documentElement.classList.add('dark')`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
