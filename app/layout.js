import "./globals.css";

export const metadata = {
  title: "Seamanship Exam App",
  description: "MVP foundation for Hebrew RTL seamanship exam preparation."
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
