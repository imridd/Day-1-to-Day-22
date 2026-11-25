import { AppTheme } from "../components/AppTheme";
export const metadata = {
  title: "Helpdesk | Support, in sync",
  description: "Ticket-based customer support workspace",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AppTheme>{children}</AppTheme>
      </body>
    </html>
  );
}
