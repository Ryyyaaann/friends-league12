import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Friend's League",
  description: "The ultimate platform for gaming championships and backlog tracking.",
};

import ClickEffects from "@/components/ClickEffects";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased bg-background text-foreground`}
      >
        <ClickEffects />
        {children}
      </body>
    </html>
  );
}
