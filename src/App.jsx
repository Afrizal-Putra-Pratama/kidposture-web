import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChildrenPage from "./pages/ChildrenPage.jsx";
import ChildScreeningsPage from "./pages/ChildScreeningsPage.jsx";
import ScreeningDetailPage from "./pages/ScreeningDetailPage.jsx";
import NewScreeningPage from "./pages/NewScreeningPage.jsx";
import EducationPage from './pages/EducationPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ParentDashboard from "./pages/ParentDashboard.jsx";
import LoginPage from "./pages/LoginPage";

// ✅ Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* ✅ Protected Routes */}
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
        
        {/* Screening Detail */}
        <Route 
          path="/screenings/:id" 
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

        {/* ✅ 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
