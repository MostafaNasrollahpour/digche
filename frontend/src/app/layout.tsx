import type { Metadata } from "next";
import { AuthSessionProvider } from "@/features/auth/components/AuthSessionProvider";
import "./globals.css";
import { ReactQueryProvider } from "@/shared/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Digcheh",
  description: "Digcheh home-made food marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AuthSessionProvider>
            <ReactQueryProvider>
          <div className="min-h-dvh w-full overflow-x-clip">
            {children}
          </div>
          </ReactQueryProvider>

        </AuthSessionProvider>
      </body>
    </html>
  );
}