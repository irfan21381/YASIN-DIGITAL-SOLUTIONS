import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "YDS EduAI",
  description: "Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
