import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/ui/chat-widget";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LoginModal } from "@/components/auth/login-modal";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Inbox | Paquetería y Envíos",
  description:
    "Rastrea, cotiza y envía tus paquetes con Inbox. Cobertura nacional, recolección a domicilio y entrega segura.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
          <LoginModal />
        </AuthProvider>
      </body>
    </html>
  );
}
