import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AdminRoute } from "./components/AdminRoute";
import { GamesListPage } from "./pages/GamesListPage";
import { GameDetailPage } from "./pages/GameDetailPage";
import { AuthPage } from "./pages/AuthPage";
import { AdminPage } from "./pages/AdminPage";

export function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<GamesListPage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;