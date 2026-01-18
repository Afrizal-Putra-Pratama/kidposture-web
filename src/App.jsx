import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChildrenPage from "./pages/ChildrenPage.jsx";
import ChildScreeningsPage from "./pages/ChildScreeningsPage.jsx";
import ScreeningDetailPage from "./pages/ScreeningDetailPage.jsx";
import NewScreeningPage from "./pages/NewScreeningPage.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChildrenPage />} />
        <Route path="/children/:childId/screenings" element={<ChildScreeningsPage />} />
        <Route path="/children/:childId/screenings/new" element={<NewScreeningPage />} />
        <Route path="/screenings/:id" element={<ScreeningDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
