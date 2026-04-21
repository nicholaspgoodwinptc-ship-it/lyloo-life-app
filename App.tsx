import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import MentalWellness from './pages/MentalWellness';
import PhysicalWellness from './pages/PhysicalWellness';
import Nutrition from './pages/Nutrition'; // NOUVEAU: Import de la page Nutrition
import Community from './pages/Community';
import Suivi from './pages/Suivi';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Shop from './pages/Shop';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen flex items-center justify-center text-lyloo-anthracite bg-lyloo-beige">Chargement...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/mental" element={<ProtectedRoute><MentalWellness /></ProtectedRoute>} />
            <Route path="/physique" element={<ProtectedRoute><PhysicalWellness /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} /> {/* NOUVEAU: Route Nutrition */}
            <Route path="/communaute" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/suivi" element={<ProtectedRoute><Suivi /></ProtectedRoute>} />
            <Route path="/boutique" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
            
            <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;