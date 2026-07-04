import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RS20 // Formula Motorsport Performance Concept",
  description: "Experience the next dimension of luxury motorsport. Built with Next.js 15, React Three Fiber, WebGL, custom GLSL shaders, GSAP, and premium interaction design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
