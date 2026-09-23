import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="bg-linear-to-b from-white via-white to-bg-tint min-h-screen ">
        <Navbar />
        <main className="mx-auto px-[72px] py-10 min-h-[calc(100vh-56px)] flex items-center justify-center ">
          {children}
        </main>
      </body>
    </html>
  );
}
