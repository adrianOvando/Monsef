import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const SIDEBAR_WIDTH = 240;
const MOBILE_BREAKPOINT = 768;

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track window width for responsive layout
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        // On desktop always "open" (sidebar is always visible)
        setSidebarOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // ── Styles ──────────────────────────────────────────────────────────────────

  const rootStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    fontFamily: 'Arial, Helvetica, sans-serif',
    backgroundColor: '#F5F5F5',
  };

  // Overlay that dims the content on mobile when sidebar is open
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 199,
    display: isMobile && sidebarOpen ? 'block' : 'none',
    cursor: 'pointer',
  };

  // The right-side main region (shifts right on desktop to make room for sidebar)
  const mainRegionStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
    height: '100vh',
    overflow: 'hidden',
    transition: 'margin-left 0.28s ease',
  };

  // Scrollable content area between navbar and footer
  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: '#F5F5F5',
    boxSizing: 'border-box',
  };

  return (
    <div style={rootStyle}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Mobile overlay */}
      <div
        style={overlayStyle}
        onClick={handleCloseSidebar}
        aria-hidden="true"
      />

      {/* Main region */}
      <div style={mainRegionStyle}>
        {/* Top navigation bar */}
        <Navbar onToggleSidebar={handleToggleSidebar} />

        {/* Page content */}
        <main style={contentStyle} id="main-content" tabIndex={-1}>
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
