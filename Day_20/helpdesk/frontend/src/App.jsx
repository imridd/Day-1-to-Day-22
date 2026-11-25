import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLE_HOME } from './utils/constants';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Chat from './pages/Chat';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerAgents from './pages/manager/Agents';
import ManagerTickets from './pages/manager/Tickets';
import AgentDashboard from './pages/agent/Dashboard';
import AgentTickets from './pages/agent/MyTickets';
import CustomerDashboard from './pages/customer/Dashboard';
import RaiseIssue from './pages/customer/RaiseIssue';
import CustomerTickets from './pages/customer/MyTickets';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />;
}

const guarded = (role, element) => (
  <ProtectedRoute roles={[role]}>
    <AppLayout>{element}</AppLayout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/manager" element={guarded('MANAGER', <ManagerDashboard />)} />
      <Route path="/manager/agents" element={guarded('MANAGER', <ManagerAgents />)} />
      <Route path="/manager/tickets" element={guarded('MANAGER', <ManagerTickets />)} />
      <Route path="/manager/chat" element={guarded('MANAGER', <Chat />)} />

      <Route path="/agent" element={guarded('AGENT', <AgentDashboard />)} />
      <Route path="/agent/tickets" element={guarded('AGENT', <AgentTickets />)} />
      <Route path="/agent/chat" element={guarded('AGENT', <Chat />)} />

      <Route path="/customer" element={guarded('CUSTOMER', <CustomerDashboard />)} />
      <Route path="/customer/raise-issue" element={guarded('CUSTOMER', <RaiseIssue />)} />
      <Route path="/customer/tickets" element={guarded('CUSTOMER', <CustomerTickets />)} />
      <Route path="/customer/chat" element={guarded('CUSTOMER', <Chat />)} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
