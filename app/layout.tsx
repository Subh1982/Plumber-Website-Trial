import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hornsby Star Plumbers | Local Plumbing Services",
  description: "Reliable plumbing services across Hornsby and Sydney's Upper North Shore. Call for blocked drains, leaks, burst pipes, hot water, gas fitting and more.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-AU"><body>{children}</body></html>;
}
