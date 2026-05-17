import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AccessibilityWidget from "./components/AccessibilityWidget";
import ChildrenPage from "./pages/ChildrenPage.jsx";
import ChildScreeningsPage from "./pages/ChildScreeningsPage.jsx";
import ScreeningDetailPage from "./pages/ScreeningDetailPage.jsx";
import NewScreeningPage from "./pages/NewScreeningPage.jsx";
import EducationPage from "./pages/EducationPage.jsx";
import ArticleDetailPage from "./pages/ArticleDetailPage.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";

import ParentProfilePage from "./pages/ParentProfilePage.jsx";

// Landing pages
import LandingPage from "./pages/LandingPage.jsx";

// Team pages
import TeamPage from "./pages/TeamPage";
import TeamFoundingPage from "./pages/TeamFoundingPage";
import TeamCorePage from "./pages/TeamCorePage";
import TeamExpertPage from "./pages/TeamExpertPage";
import TeamDetailPage from "./pages/TeamDetailPage";

// Physio lama
import PhysioDashboardPage from "./pages/PhysioDashboardPage.jsx";
import PhysioScreeningDetailPage from "./pages/physio/PhysioScreeningDetailPage.jsx";

// Direktori fisio lama
import PhysiotherapistDetail from "./pages/physio/PhysiotherapistDetail.jsx";
import PhysioChatPage from "./pages/physio/Physiochatpage.jsx";

// FASE 1
import RegisterPhysioPage from "./pages/auth/RegisterPhysioPage.jsx";
import PhysioProfilePage from "./pages/physio/PhysioProfilePage.jsx";
import PhysiotherapistListPage from "./pages/parent/PhysiotherapistListPage.jsx";
import AdminPhysioManagementPage from "./pages/admin/AdminPhysioManagementPage.jsx";

// Register parent
import RegisterParentPage from "./pages/auth/RegisterParentPage.jsx";

// Physio articles
import PhysioEducationPage from "./pages/PhysioEducationPage.jsx";
import PhysioArticleFormPage from "./pages/PhysioArticleFormPage.jsx";

// Halaman Peta Fisioterapis
import PhysioMapPage from "./pages/PhysioMapPage.jsx";

// Payment & Chat
import PaymentPage from "./pages/parent/PaymentPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

function ProtectedRoute({ children, allowedRoles = null }) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role = user?.role?.toLowerCase();

  // Tidak ada token atau user → ke login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Ada role restriction → cek role
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin/physiotherapists" replace />;
    if (role === "physio") return <Navigate to="/physio/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AccessibilityWidget />

      <Routes>
        {/* Public Landing Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Team Routes */}
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/founders" element={<TeamFoundingPage />} />
        <Route path="/team/core" element={<TeamCorePage />} />
        <Route path="/team/experts" element={<TeamExpertPage />} />
        <Route path="/team/:group/:slug" element={<TeamDetailPage />} />

        <Route path="/team/expert" element={<Navigate to="/team/experts" replace />} />
        <Route path="/team/staff" element={<Navigate to="/team/core" replace />} />
        {/* Halaman Peta Fisioterapis Public */}
        <Route path="/physiotherapists/map" element={<PhysioMapPage />} />
        <Route path="/map" element={<Navigate to="/physiotherapists/map" replace />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/physio" element={<RegisterPhysioPage />} />
        <Route path="/register/parent" element={<RegisterParentPage />} />

        {/* Education Public */}
        <Route path="/education" element={<EducationPage />} />
        <Route path="/education/:slug" element={<ArticleDetailPage />} />

        {/* Parent Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <ChildrenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children/:childId/screenings"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <ChildScreeningsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children/:childId/screenings/new"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <NewScreeningPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/screenings/:screeningId"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <ScreeningDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <ParentProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Direktori Fisioterapis Parent */}
        <Route
          path="/physiotherapists"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <PhysiotherapistListPage />
            </ProtectedRoute>
          }
        />

        <Route path="/physios" element={<Navigate to="/physiotherapists" replace />} />

        <Route
          path="/physios/:id"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <PhysiotherapistDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physiotherapists/:id"
          element={
            <ProtectedRoute allowedRoles={["parent", "user"]}>
              <PhysiotherapistDetail />
            </ProtectedRoute>
          }
        />

        {/* Physio Routes */}
        <Route
          path="/physio/dashboard"
          element={
            <ProtectedRoute allowedRoles={["physio"]}>
              <PhysioDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/profile"
          element={
            <ProtectedRoute allowedRoles={["physio"]}>
              <PhysioProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/education"
          element={
            <ProtectedRoute allowedRoles={["physio"]}>
              <PhysioEducationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/chat"
          element={
            <ProtectedRoute allowedRoles={["physio"]}>
              <PhysioChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/education/create"
          element={
            <ProtectedRoute allowedRoles={["physio"]}>
              <PhysioArticleFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/education/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["physio"]}>
              <PhysioArticleFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/screenings/:screeningId"
          element={
            <ProtectedRoute allowedRoles={["physio"]}>
              <PhysioScreeningDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/physiotherapists"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPhysioManagementPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;