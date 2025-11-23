'use client'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { config } from '@/contract/config';

const inter = Inter({ subsets: ["latin"] })

const queryClient = new QueryClient();

// export const metadata: Metadata = {
//   title: "BrickByte",
//   description: "Invest in real estate properties using modern technology",
//   verification: {
//     google: "I7qFz3JjR3w6dZXJl1VXQGDvdzK_HURhjVGQ2AwN9_U",
//   },
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
          <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        <ClientLayout>{children}</ClientLayout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
      </body>
    </html>
  )
}

import './globals.css'