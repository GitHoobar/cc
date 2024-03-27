import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from '@next/font/local'


const inter = Inter({ subsets: ["latin"] });

const minecraft = localFont({
  src: [
    {
      path: '../../fonts/Minecraft.ttf',
    }
  ],
  variable: '--font-minecraft'
})

export const metadata: Metadata = {
  title: "CaptionCraft",
  description: "A Video tanscription service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
    
  );
}
