// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChildrenPage from "./pages/ChildrenPage.jsx";
import ChildScreeningsPage from "./pages/ChildScreeningsPage.jsx";
import ScreeningDetailPage from "./pages/ScreeningDetailPage.jsx";
import NewScreeningPage from "./pages/NewScreeningPage.jsx";
import EducationPage from "./pages/EducationPage.jsx";
import ArticleDetailPage from "./pages/ArticleDetailPage.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NewChildPage from "./pages/NewChildPage.jsx";
import PhysioDashboardPage from "./pages/PhysioDashboardPage.jsx";

// Physio (file lama)
import PhysioScreeningDetailPage from "./pages/physio/PhysioScreeningDetailPage.jsx";

// Direktori fisio (file lama)
import PhysiotherapistList from "./pages/physio/PhysiotherapistList.jsx";
import PhysiotherapistDetail from "./pages/physio/PhysiotherapistDetail.jsx";

// FASE 1 (file baru)
import RegisterPhysioPage from "./pages/auth/RegisterPhysioPage.jsx";
import PhysioProfilePage from "./pages/physio/PhysioProfilePage.jsx";
import PhysiotherapistListPage from "./pages/parent/PhysiotherapistListPage.jsx";
import AdminPhysioManagementPage from "./pages/admin/AdminPhysioManagementPage.jsx";

// FASE 2 (file baru)
import LandingPage from "./pages/LandingPage.jsx";

// ✅ Protected Route: hanya cek token
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ✅ Role-based Route: cek role user
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
      <Routes>
        {/* Landing Page (Public) */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/physio" element={<RegisterPhysioPage />} />

        {/* Protected Routes (Parent default) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Children Management */}
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

        {/* Screening Detail (Parent) */}
        <Route
          path="/screenings/:screeningId"
          element={
            <ProtectedRoute>
              <ScreeningDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Education */}
        <Route
          path="/education"
          element={
            <ProtectedRoute>
              <EducationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/education/:slug"
          element={
            <ProtectedRoute>
              <ArticleDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Direktori Fisioterapis (Parent) - gunakan yang baru dengan filter & maps */}
        <Route
          path="/physiotherapists"
          element={
            <ProtectedRoute>
              <PhysiotherapistListPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy route /physios redirect ke /physiotherapists */}
        <Route
          path="/physios"
          element={<Navigate to="/physiotherapists" replace />}
        />

        <Route
          path="/physios/:id"
          element={
            <ProtectedRoute>
              <PhysiotherapistDetail />
            </ProtectedRoute>
          }
        />

        {/* Physio Routes (role: physio) */}
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
          path="/physio/screenings/:screeningId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["physio"]}>
                <PhysioScreeningDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes (role: admin) */}
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

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
