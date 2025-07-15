import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "@/components/theme-provider"
import { PhantomProvider } from "@/chat/walletprovider";
import '@/styles/global-utils.css';

export const metadata: Metadata = {
  title: "Agentzk",
  description: "The best AI Chat ever made",
  icons: "/images/agentzk-logo.png",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <PhantomProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
        </PhantomProvider>
      </body>
    </html>
  )
}