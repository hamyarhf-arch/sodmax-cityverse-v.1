import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Layout.css';

const Layout = () => {
    const { isAuthenticated, user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileNavOpen(false);
        setSidebarOpen(false);
    }, [location.pathname]);

    // Prevent scroll when mobile menu is open
    useEffect(() => {
        if (mobileNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileNavOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // TODO: Open search modal
                console.log('Open search');
            }
            
            // Escape to close menus
            if (e.key === 'Escape') {
                setMobileNavOpen(false);
                setSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Redirect based on user type
    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            const path = location.pathname;
            
            // Don't redirect if already on correct dashboard
            if (
                (user.user_type === 'business' && path.startsWith('/business')) ||
                (user.user_type === 'admin' && path.startsWith('/admin')) ||
                (user.user_type === 'user' && !path.startsWith('/business') && !path.startsWith('/admin'))
            ) {
                return;
            }

            // Redirect to appropriate dashboard
            if (path === '/' || path === '/home') {
                if (user.user_type === 'business') {
                    navigate('/business/dashboard', { replace: true });
                } else if (user.user_type === 'admin') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }
        }
    }, [loading, isAuthenticated, user, location.pathname, navigate]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleMobileNav = () => setMobileNavOpen(!mobileNavOpen);

    // Determine layout based on authentication and user type
    const showFullLayout = isAuthenticated && !['/login', '/register', '/business/register'].includes(location.pathname);

    if (!showFullLayout) {
        return (
            <div className="layout-container minimal-layout">
                <Outlet />
            </div>
        );
    }

    return (
        <div className="layout-container">
            {/* Header */}
            <Header 
                onMenuClick={toggleMobileNav}
                onSearchClick={() => console.log('Search clicked')}
                user={user}
            />

            {/* Sidebar (Desktop) */}
            <Sidebar 
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
            />

            {/* Mobile Navigation */}
            <MobileNav 
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
                user={user}
            />

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    {/* Breadcrumb (optional) */}
                    {/* <Breadcrumb /> */}
                    
                    {/* Page Content */}
                    <div className="page-content">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Bottom Navigation (Mobile) */}
            {isAuthenticated && user?.user_type === 'user' && (
                <nav className="bottom-nav">
                    <button 
                        className={`bottom-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        <i className="fas fa-home"></i>
                        <span>داشبورد</span>
                    </button>
                    
                    <button 
                        className={`bottom-nav-item ${location.pathname === '/missions' ? 'active' : ''}`}
                        onClick={() => navigate('/missions')}
                    >
                        <i className="fas fa-tasks"></i>
                        <span>مأموریت‌ها</span>
                    </button>
                    
                    <button 
                        className={`bottom-nav-item ${location.pathname === '/mining' ? 'active' : ''}`}
                        onClick={() => navigate('/mining')}
                    >
                        <i className="fas fa-hard-hat"></i>
                        <span>استخراج</span>
                    </button>
                    
                    <button 
                        className={`bottom-nav-item ${location.pathname === '/wallet' ? 'active' : ''}`}
                        onClick={() => navigate('/wallet')}
                    >
                        <i className="fas fa-wallet"></i>
                        <span>کیف پول</span>
                    </button>
                    
                    <button 
                        className={`bottom-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                        onClick={() => navigate('/profile')}
                    >
                        <i className="fas fa-user"></i>
                        <span>پروفایل</span>
                    </button>
                </nav>
            )}

            {/* Floating Action Button (Mobile) */}
            {isAuthenticated && user?.user_type === 'user' && (
                <button className="fab" onClick={() => navigate('/missions?filter=quick')}>
                    <i className="fas fa-bolt"></i>
                </button>
            )}

            {/* Back to Top Button */}
            <button 
                className="back-to-top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="برگشت به بالا"
            >
                <i className="fas fa-arrow-up"></i>
            </button>
        </div>
    );
};

export default Layout;
