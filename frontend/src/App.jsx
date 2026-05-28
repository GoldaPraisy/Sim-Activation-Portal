import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, Smartphone, Users, Zap, ClipboardList, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import SimCards from './pages/SimCards';
import Customers from './pages/Customers';
import Activate from './pages/Activate';
import Activations from './pages/Activations';
import './App.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sims', icon: Smartphone, label: 'SIM Cards' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/activate', icon: Zap, label: 'Activate SIM' },
  { to: '/activations', icon: ClipboardList, label: 'Activations Log' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1b4b', color: '#e0e7ff', border: '1px solid #4f46e5' }
      }} />
      <div className="app-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <Smartphone size={28} />
              <span>SIM Portal</span>
            </div>
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <span>© 2025 SIM Portal</span>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <div className="main-wrapper">
          <header className="topbar">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="topbar-title">SIM Activation Portal</div>
            <div className="topbar-badge">v1.0</div>
          </header>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sims" element={<SimCards />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/activate" element={<Activate />} />
              <Route path="/activations" element={<Activations />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
