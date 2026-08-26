import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { ActivationProvider } from './context/ActivationContext';

import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import DeviceManagement from './pages/DeviceManagement';
import PlansPage from './pages/PlansPage';
import ActivationWizard from './pages/ActivationWizard';
import ActivationDetails from './pages/ActivationDetails';
import Activations from './pages/Activations';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ActivationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0e131f',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#07090e'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#07090e'
                }
              }
            }}
          />

          {/* Sticky Demo Mode Disclaimer Banner */}
          <DemoBanner />

          <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="main-content-wrapper">
              <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />

              <main className="page-container">
                <Routes>
                  {/* Public Showcase & Auth */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/plans" element={<PlansPage />} />

                  {/* Protected Subscriber Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/devices" element={<DeviceManagement />} />
                    <Route path="/activate" element={<ActivationWizard />} />
                    <Route path="/activations" element={<Activations />} />
                    <Route path="/activations/:id" element={<ActivationDetails />} />
                  </Route>

                  {/* Protected Admin Command Center */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </ActivationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
