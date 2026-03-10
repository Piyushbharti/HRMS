import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import Dashboard from './pages/Dashboard';

const PAGE_META = {
  '/': { label: 'Dashboard', path: 'Home / Dashboard' },
  '/employees': { label: 'Employees', path: 'Home / Employees' },
  '/attendance': { label: 'Attendance', path: 'Home / Attendance' },
};

function AppShell() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || PAGE_META['/'];

  return (
    <div className="hrms-shell">
      {/* ── Sidebar ── */}
      <aside className="hrms-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">H</div>
            <div>
              <div className="brand-name">HRMS</div>
              <div className="brand-sub">Portal</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>

          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⊞</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>

          <NavLink to="/employees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">Employees</span>
          </NavLink>

          <NavLink to="/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📅</span>
            <span className="nav-label">Attendance</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sys-status">
            <div className="status-dot"></div>
            <span className="status-text">All systems online</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="hrms-main">
        <header className="hrms-topbar">
          <div className="topbar-left">
            <span className="topbar-page">{meta.label}</span>
            <span className="topbar-path">{meta.path}</span>
          </div>
          <div className="topbar-right">
            <span className="topbar-badge">HRMS Lite v2</span>
          </div>
        </header>

        <main className="hrms-page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
          </Routes>
        </main>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        toastStyle={{ fontFamily: 'Inter, sans-serif', fontSize: '13.5px', borderRadius: '12px' }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;