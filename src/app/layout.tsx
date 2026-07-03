import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TTRPG HUD — Panel de Campaña",
  description: "Panel de seguimiento en tiempo real para campaña de rol de fantasía oscura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full scanlines">
        {children}
      </body>
    </html>
  );
}
