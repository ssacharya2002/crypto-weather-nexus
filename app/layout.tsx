import "./globals.css"
import type React from "react"
import type { Metadata } from "next"

import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ReduxProvider } from "@/redux/provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CryptoWeather Nexus",
  description: "Dashboard combining weather data, cryptocurrency information, and real-time notifications",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReduxProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
