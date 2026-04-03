import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova Super App",
  description: "AI-powered full-stack development platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center px-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="text-accent">⚡</span> Nova Super
            </div>
            <nav className="ml-8 flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
              <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
            </nav>
            <div className="ml-auto flex items-center gap-4">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-secondary h-9 px-4">
                Sign In
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 px-4">
                Get Started
              </button>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
