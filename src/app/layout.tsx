import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "HeroAxes — Perfis Marvel",
 description: "Explore oito eixos comportamentais em um quiz recreativo com 24 personagens Marvel.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="pt-BR"><body>{children}</body></html>;
}
