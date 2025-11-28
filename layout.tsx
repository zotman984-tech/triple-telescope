import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "esim0 - Global eSIM Plans",
    description: "Instant eSIM delivery for 190+ countries. No physical SIM required.",
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
