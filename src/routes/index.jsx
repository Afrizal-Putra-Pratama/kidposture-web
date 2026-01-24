import { createBrowserRouter } from 'react-router-dom';

// Parent pages
import ParentDashboard from '../pages/ParentDashboard.jsx';
import ChildrenPage from '../pages/ChildrenPage.jsx';
import ChildScreeningsPage from '../pages/ChildScreeningsPage.jsx';
import NewChildPage from '../pages/NewChildPage.jsx';
import NewScreeningPage from '../pages/NewScreeningPage.jsx';
import ScreeningDetailPage from '../pages/ScreeningDetailPage.jsx';
import EducationPage from '../pages/EducationPage.jsx';
import ArticleDetailPage from '../pages/ArticleDetailPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';

// Physio pages
import PhysioDashboardPage from '../pages/PhysioDashboardPage.jsx';
import PhysioScreeningDetailPage from '../pages/physio/PhysioScreeningDetailPage.jsx';

export const router = createBrowserRouter([
  // Auth
  { path: '/login', element: <LoginPage /> },

  // Parent
  { path: '/', element: <ParentDashboard /> },
  { path: '/children', element: <ChildrenPage /> },
  { path: '/children/new', element: <NewChildPage /> },
  { path: '/children/:childId/screenings', element: <ChildScreeningsPage /> },
  { path: '/children/:childId/screenings/new', element: <NewScreeningPage /> },
  { path: '/screenings/:screeningId', element: <ScreeningDetailPage /> },
  { path: '/education', element: <EducationPage /> },
  { path: '/articles/:slug', element: <ArticleDetailPage /> },

  // Physio
  { path: '/physio/dashboard', element: <PhysioDashboardPage /> },
  { path: '/physio/screenings/:screeningId', element: <PhysioScreeningDetailPage /> },

  // Fallback 404 sederhana
  {
    path: '*',
    element: (
      <div style={{ padding: 32 }}>
        <h2>Halaman tidak ditemukan</h2>
        <p>Cek lagi URL yang kamu akses.</p>
      </div>
    ),
  },
]);
