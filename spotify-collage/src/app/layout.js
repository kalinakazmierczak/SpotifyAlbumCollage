import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/SessionProviderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Spindle — Your Vinyl Wall, Visualized",
  description:
    "Create and share your Spotify top tracks and albums as a beautiful vinyl wall.",
  keywords: ["spotify", "music", "vinyl", "top tracks", "albums", "collage", "visualize"],
  openGraph: {
    title: "Spindle — Your Vinyl Wall, Visualized",
    description: "Turn your Spotify listening history into a beautiful vinyl wall.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
