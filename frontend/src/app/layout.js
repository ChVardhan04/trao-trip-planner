import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Trao - AI Travel Planner",
  description: "Plan your perfect trip with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
