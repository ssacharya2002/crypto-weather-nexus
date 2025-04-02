import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { ReduxProvider } from "@/redux/provider"

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
          <ReduxProvider>
            <div className="flex min-h-screen flex-col">
              <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
            </div>
          </ReduxProvider>
      </body>
    </html>
  )
}
