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
        <main className="max-w-[1040px] mx-auto px-10 py-20   min-h-[calc(100vh-56px)]  ">
          {children}
        </main>
      </body>
    </html>
  );
}
