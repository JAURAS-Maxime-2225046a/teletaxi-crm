import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TELETAXI CRM",
  description: "Compagnon de saisie pour TeleTaxi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className} suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased overflow-hidden h-screen">
        <ThemeProvider>
          <Providers>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster position="bottom-right" richColors closeButton duration={4000} />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
