import "./globals.css";
import AuthControls from "../src/components/auth-controls.js";

export const metadata = {
  title: "Seamanship Exam App",
  description: "MVP foundation for Hebrew RTL seamanship exam preparation."
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div className="app-topbar">
          <AuthControls />
        </div>
        {children}
      </body>
    </html>
  );
}
