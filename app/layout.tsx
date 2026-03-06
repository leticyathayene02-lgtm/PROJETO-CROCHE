import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

// Display / headings — Fraunces: editorial, premium, artisanal feel
const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body text — DM Sans: clean, geometric, highly legible
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ateliê Digital | Crochê",
  description: "Precifique, organize e lucre com seu ateliê de crochê.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
