import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "@/components/theme-provider"
import { PhantomWalletProvider, usePhantomWallet } from "@/components/wallet-connet"

export const metadata: Metadata = {
  title: "AgentZk",
  description: "The best AI Chat ever made",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <PhantomWalletProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
        </PhantomWalletProvider>
      </body>
    </html>
  )
}
