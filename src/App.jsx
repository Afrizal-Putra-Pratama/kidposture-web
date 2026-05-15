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
import NewChildPage from "./pages/NewChildPage.jsx";
import ParentProfilePage from "./pages/ParentProfilePage.jsx";

// Landing pages
import LandingPage from "./pages/LandingPage.jsx";

// Team pages
import TeamPage from "./pages/TeamPage.jsx";
import TeamExpertPage from "./pages/TeamExpertPage.jsx";
import TeamStaffPage from "./pages/TeamStaffPage.jsx";
import TeamDetailPage from "./pages/TeamDetailPage.jsx";

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

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ children, allowedRoles }) {
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role = user?.role?.toLowerCase();

  if (!user || !allowedRoles.includes(role)) {
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
        <Route path="/team/expert" element={<TeamExpertPage />} />
        <Route path="/team/staff" element={<TeamStaffPage />} />
        <Route path="/team/:slug" element={<TeamDetailPage />} />

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
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
              <ChildrenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children/new"
          element={
            <ProtectedRoute>
              <NewChildPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children/:childId/screenings"
          element={
            <ProtectedRoute>
              <ChildScreeningsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children/:childId/screenings/new"
          element={
            <ProtectedRoute>
              <NewScreeningPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/screenings/:screeningId"
          element={
            <ProtectedRoute>
              <ScreeningDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ParentProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Direktori Fisioterapis Parent */}
        <Route
          path="/physiotherapists"
          element={
            <ProtectedRoute>
              <PhysiotherapistListPage />
            </ProtectedRoute>
          }
        />

        <Route path="/physios" element={<Navigate to="/physiotherapists" replace />} />

        <Route
          path="/physios/:id"
          element={
            <ProtectedRoute>
              <PhysiotherapistDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physiotherapists/:id"
          element={
            <ProtectedRoute>
              <PhysiotherapistDetail />
            </ProtectedRoute>
          }
        />

        {/* Physio Routes */}
        <Route
          path="/physio/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioProfilePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/education"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioEducationPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/chat"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioChatPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/education/create"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioArticleFormPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/education/:id/edit"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioArticleFormPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/physio/screenings/:screeningId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioScreeningDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/physiotherapists"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <AdminPhysioManagementPage />
              </RoleRoute>
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