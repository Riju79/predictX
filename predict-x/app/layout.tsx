import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PredictX — Trade Everything",
  description:
    "The first prediction market platform with funded accounts — trade elections, sports, crypto and more, settled instantly on Stellar via Soroban smart contracts.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

import { WalletProvider, WalletModal } from "@/src/wallet";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,500;1,400&family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProvider>
          <WalletModal />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
