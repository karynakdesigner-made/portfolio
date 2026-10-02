import type { Metadata } from "next";
import localFont from "next/font/local";
import { Ubuntu } from "next/font/google";
import "./globals.css";

/* Ubuntu - used ONLY inside the GEP Welcome hero visual (matches its Figma
   source). Exposed as a CSS variable so it never leaks to global typography. */
const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const mosvita = localFont({
  variable: "--font-inter",
  src: [
    { path: "../fonts/mosvita/Mosvita-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/mosvita/Mosvita-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/mosvita/Mosvita-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../fonts/mosvita/Mosvita-Black.otf", weight: "900", style: "normal" },
  ],
  display: "swap",
});

const patience = localFont({
  variable: "--font-patience",
  src: [{ path: "../fonts/patience/ThePatience.otf", weight: "400", style: "normal" }],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Karina Kravchenko - Senior Product Designer",
  description:
    "Senior UX Designer working on AI products, complex systems, and the interfaces in between.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mosvita.variable} ${patience.variable} ${ubuntu.variable} antialiased`}>
      <body className="bg-white text-[#211B1C]">{children}</body>
    </html>
  );
}
