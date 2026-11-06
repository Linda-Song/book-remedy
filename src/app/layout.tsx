import { Fraunces, Nunito, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { AuthInit } from "@/features/auth/AuthInit";

// Body font and heading font; names are wired to Tailwind in globals.css
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
// Used only inside the share-card preview
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} ${notoSans.variable}`}
    >
      <body className="bg-linear-to-b from-white via-white to-bg-tint min-h-screen ">
        <AuthInit />
        <Navbar />
        <main className="max-w-[1040px] mx-auto px-10 py-20   min-h-[calc(100vh-56px)]  ">
          {children}
        </main>
      </body>
    </html>
  );
}
