import { useEffect } from "react";
import {Routes,Route,Navigate,useNavigate,useParams,} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadPages } from "./features/pages/pageSlice";
import EmptyState from "./components/common/EmptyState";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PublicLayout from "./layouts/PublicLayout";
import PageRenderer from "./pages/PageRenderer";
function Protected() {
  const admin = useSelector((s) => s.auth.admin);
  return admin ? <Dashboard /> : <Navigate to="/login" replace />;
}
function PublicPage() {
  const { slug } = useParams(),
    { items, status } = useSelector((s) => s.pages);
  const page = items.find((p) => p.slug === slug && p.status === "published");
  if (status === "loading") return <p className="p-5">Loading page…</p>;
  return page ? (
    <PageRenderer page={page} />
  ) : (
    <div className="empty-state">
      <h1>404 — Page not found</h1>
      <p>This page may be a draft or may have been removed.</p>
    </div>
  );
}
function Home() {
  const dispatch = useDispatch(),
    navigate = useNavigate(),
    { items, status } = useSelector((s) => s.pages);
  useEffect(() => {
    dispatch(loadPages());
  }, [dispatch]);
  const pages = items.filter((p) => p.status === "published");
  if (status === "loading" || status === "idle")
    return <div className="empty-state">Loading your website…</div>;
  if (!pages.length) return <EmptyState onCreate={() => navigate("/login")} />;
  return <Navigate to={`/${pages[0].slug}`} replace />;
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={<Protected />} />
      <Route element={<PublicLayout />}>
        <Route path="/:slug" element={<PublicPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
