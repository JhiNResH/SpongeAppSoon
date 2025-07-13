import "./globals.css";
import { Metadata } from "next";
import { Inter, Nanum_Pen_Script } from "next/font/google";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";
import dynamic from "next/dynamic";
import { cn } from "./lib/utils";

const Providers = dynamic(() => import("./providers"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

const nanum = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-nanum",
});

export const metadata: Metadata = {
  title: "Sponge",
  description: "svmUSD is an overcollateralized dollar backed by diversified crypto assets. Soak up assets and squeeze out sustainable yield.",
  icons: {
    icon: "/Sponge.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, nanum.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Navbar />
            <div className="h-full flex-1">{children}</div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
