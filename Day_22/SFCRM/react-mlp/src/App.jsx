
import { useState } from "react";
import CRMLayout from "./components/common/CRMLayout";
import LoginScreen from "./components/auth/LoginScreen";
import { setDemoUser } from "./lib/api";

export default function App() {
  const [session, setSession] = useState(null);

  function handleLogin(loginSession) {
    setSession(loginSession);
  }

  function handleLogout() {
    setSession(null);
    setDemoUser("u1");
  }

  if (!session?.user?.Id) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <CRMLayout
      currentUser={session.user}
      onLogout={handleLogout}
    />
  );
}
