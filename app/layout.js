import "./globals.css";
import SwRegister from "../components/SwRegister";
import Nav from "../components/Nav";

export const metadata = {
  title: "가계부",
  description: "수입과 지출을 기록하는 가계부",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "가계부",
  },
};

export const viewport = {
  themeColor: "#3182ce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Nav />
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
