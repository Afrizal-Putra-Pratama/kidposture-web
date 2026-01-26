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

// file lama yang memang sudah ada
import PhysioScreeningDetailPage from "./pages/physio/PhysioScreeningDetailPage.jsx";

// Direktori fisio (file baru)
import PhysiotherapistList from "./pages/physio/PhysiotherapistList.jsx";
import PhysiotherapistDetail from "./pages/physio/PhysiotherapistDetail.jsx";

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
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes (Parent default) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

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

        {/* Direktori Fisioterapis (Parent) */}
        <Route
          path="/physios"
          element={
            <ProtectedRoute>
              <PhysiotherapistList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/physios/:id"
          element={
            <ProtectedRoute>
              <PhysiotherapistDetail />
            </ProtectedRoute>
          }
        />

        {/* Physio Dashboard (hanya role physio) */}
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

        {/* Physio Screening Detail */}
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

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
