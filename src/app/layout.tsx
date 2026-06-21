import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DharaSetu - Zameen Se Samriddhi Tak",
  description: "DharaSetu is a rural-tech farmer onboarding platform connecting CSC operators with farmers for seamless registration and documentation services.",
  keywords: "DharaSetu, farmer registration, CSC, VLE, rural tech, agriculture, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
