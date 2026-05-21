import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "StudentPortal — Academic Identity, Verified",
    template: "%s · StudentPortal",
  },
  description:
    "Access your timetable, scorecard, attendance, and verified academic records with secure QR-based credentials. No passwords, no hassle.",
  keywords: [
    "student portal",
    "verifiable credentials",
    "academic records",
    "QR login",
    "digital identity",
    "scorecard",
    "timetable",
  ],
  authors: [{ name: "StudentPortal" }],
  applicationName: "StudentPortal",
  themeColor: "#4f46e5",
  colorScheme: "light",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    title: "StudentPortal — Academic Identity, Verified",
    description:
      "Your timetable, scorecard, and verified credentials in one secure portal. No passwords required.",
    siteName: "StudentPortal",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudentPortal — Academic Identity, Verified",
    description:
      "Your timetable, scorecard, and verified credentials in one secure portal.",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
