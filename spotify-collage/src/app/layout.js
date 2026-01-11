import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/SessionProviderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Spindle - Your Vinyl Wall, Visualized",
  description:
    "Create and share your Spotify top tracks as a beautiful vinyl wall. See your music taste visualized.",
  keywords: ["spotify", "music", "vinyl", "top tracks", "playlist", "share"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
