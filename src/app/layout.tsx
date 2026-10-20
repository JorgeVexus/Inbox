import type { Metadata, Viewport } from "next";
import { DESCRIPCION_BASE, NOMBRE_SITIO, SITE_URL } from "@/lib/seo";
import type { ReactNode } from "react";
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
  metadataBase: new URL(SITE_URL),
  title: { default: "Inbox | Paquetería y Envíos", template: "%s | Inbox" },
  description: DESCRIPCION_BASE,
  applicationName: NOMBRE_SITIO,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Inbox | Paquetería y Envíos",
    description: DESCRIPCION_BASE,
    url: "/",
    siteName: NOMBRE_SITIO,
    locale: "es_MX",
    type: "website",
    images: [{ url: "/images/hero-1.webp", width: 2000, height: 800, alt: "Camión de reparto Inbox" }],
  },
  twitter: { card: "summary_large_image", title: "Inbox | Paquetería y Envíos", description: DESCRIPCION_BASE },
};

export const viewport: Viewport = { themeColor: "#ff6015" };

const DATOS_ESTRUCTURADOS = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: NOMBRE_SITIO,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-blanco-horizontal.png`,
  description: DESCRIPCION_BASE,
  areaServed: "MX",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+52-800-713-1000",
      availableLanguage: "es",
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <script
          type="application/ld+json"
          // JSON estático escrito por nosotros (sin datos del usuario): seguro de inyectar.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DATOS_ESTRUCTURADOS) }}
        />
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
