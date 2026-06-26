import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Lesson from './pages/Lesson';

export default function App() {
  const { isOnboarded } = useUserStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isOnboarded ? <Home /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/onboarding"
          element={!isOnboarded ? <Onboarding /> : <Navigate to="/" replace />}
        />
        <Route path="/lesson/:id" element={<Lesson />} />
      </Routes>
    </BrowserRouter>
  );
}
