import { Navigation } from "@/components/navigation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Fitlog",
  description: "Track your CrossFit workouts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${mono.variable} font-sans min-h-dvh antialiased bg-background-neutral-default text-foreground-neutral-default`}
      >
        <Navigation />
        <main className="md:pt-14 pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
