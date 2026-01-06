/* Header Container */
.header {
    background: rgba(30, 41, 59, 0.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    height: 70px;
}

.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
}

/* Header Left */
.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
}

/* Mobile Menu Button */
.mobile-menu-btn {
    display: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

/* Logo */
.header-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: transform 0.3s ease;
}

.header-logo:hover {
    transform: translateY(-2px);
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #0066FF 0%, #3395FF 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
    color: white;
    box-shadow: 0 8px 24px rgba(0, 102, 255, 0.3);
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo-title {
    font-size: 18px;
    font-weight: 900;
    background: linear-gradient(135deg, #0066FF 0%, #00D4AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
}

.logo-subtitle {
    font-size: 10px;
    color: #9ca3af;
    letter-spacing: 1px;
}

/* Desktop Navigation */
.desktop-nav {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 20px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 12px;
    color: #d1d5db;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateY(-2px);
}

.nav-link.active {
    background: rgba(0, 102, 255, 0.2);
    color: #0066FF;
}

.nav-link i {
    font-size: 16px;
}

/* Header Center */
.header-center {
    flex: 2;
    max-width: 600px;
    padding: 0 20px;
}

/* Search Container */
.search-container {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.search-input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    right: 16px;
    color: #6b7280;
    font-size: 16px;
    pointer-events: none;
}

.search-input {
    width: 100%;
    height: 44px;
    padding: 0 44px 0 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: white;
    font-family: 'Vazirmatn', sans-serif;
    font-size: 14px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #0066FF;
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.2);
    background: rgba(255, 255, 255, 0.12);
}

.search-input::placeholder {
    color: #6b7280;
}

.clear-search {
    position: absolute;
    left: 12px;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;
}

.clear-search:hover {
    color: white;
}

.search-btn {
    height: 44px;
    padding: 0 20px;
    background: linear-gradient(135deg, #0066FF 0%, #3395FF 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Vazirmatn', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.search-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 102, 255, 0.3);
}

/* Header Right */
.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    justify-content: flex-end;
}

/* Quick Actions */
.quick-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.quick-action-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.quick-action-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

/* Notifications */
.notifications-container {
    position: relative;
}

.notifications-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.notifications-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.notifications-btn.active {
    background: rgba(0, 102, 255, 0.2);
    border-color: #0066FF;
    color: #0066FF;
}

.notification-badge {
    position: absolute;
    top: -4px;
    left: -4px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 900;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(30, 41, 59, 0.9);
}

/* Notifications Dropdown */
.notifications-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    width: 380px;
    background: rgba(30, 41, 59, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    animation: slideDown 0.3s ease-out;
    z-index: 1001;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notifications-header h3 {
    font-size: 16px;
    font-weight: 800;
    color: white;
    margin: 0;
}

.mark-all-read {
    background: none;
    border: none;
    color: #0066FF;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.3s ease;
}

.mark-all-read:hover {
    color: #3395FF;
    text-decoration: underline;
}

.notifications-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px 0;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 20px;
    gap: 12px;
    cursor: pointer;
    transition: background 0.3s ease;
    position: relative;
}

.notification-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
    background: rgba(0, 102, 255, 0.05);
}

.notification-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.text-success {
    color: #10b981;
}

.text-warning {
    color: #f59e0b;
}

.text-info {
    color: #3b82f6;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-title {
    font-size: 13px;
    font-weight: 800;
    color: white;
    margin-bottom: 4px;
}

.notification-message {
    font-size: 12px;
    color: #d1d5db;
    line-height: 1.4;
    margin-bottom: 4px;
}

.notification-time {
    font-size: 11px;
    color: #6b7280;
}

.notification-dot {
    position: absolute;
    top: 16px;
    left: 8px;
    width: 8px;
    height: 8px;
    background: #0066FF;
    border-radius: 50%;
}

.no-notifications {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #6b7280;
    text-align: center;
}

.no-notifications i {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.5;
}

.no-notifications p {
    font-size: 14px;
    margin: 0;
}

.notifications-footer {
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
}

.view-all {
    color: #0066FF;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
}

.view-all:hover {
    color: #3395FF;
    text-decoration: underline;
}

/* Profile Container */
.profile-container {
    position: relative;
}

.profile-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 6px 12px 6px 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 180px;
}

.profile-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.profile-btn.active {
    background: rgba(0, 102, 255, 0.2);
    border-color: #0066FF;
}

.profile-avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #0066FF 0%, #3395FF 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
}

.profile-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
    min-width: 0;
}

.profile-name {
    font-size: 13px;
    font-weight: 800;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
}

.profile-level {
    font-size: 11px;
    color: #00D4AA;
    font-weight: 700;
}

.profile-arrow {
    font-size: 12px;
    color: #9ca3af;
    transition: transform 0.3s ease;
}

.profile-btn.active .profile-arrow {
    transform: rotate(180deg);
    color: #0066FF;
}

/* Profile Dropdown */
.profile-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    width: 300px;
    background: rgba(30, 41, 59, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    animation: slideDown 0.3s ease-out;
    z-index: 1001;
}

.dropdown-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: rgba(0, 102, 255, 0.1);
}

.dropdown-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #0066FF 0%, #00D4AA 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
}

.dropdown-name {
    font-size: 16px;
    font-weight: 800;
    color: white;
    margin-bottom: 4px;
}

.dropdown-email {
    font-size: 12px;
    color: #9ca3af;
}

.dropdown-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 20px;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    color: #d1d5db;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: right;
    font-family: 'Vazirmatn', sans-serif;
}

.dropdown-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    padding-right: 24px;
}

.dropdown-item i {
    font-size: 16px;
    width: 20px;
    text-align: center;
}

.logout-btn {
    color: #ef4444;
}

.logout-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.dropdown-wallet {
    padding: 16px 20px;
    background: rgba(0, 102, 255, 0.05);
}

.wallet-balance {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
}

.wallet-balance i {
    color: #00D4AA;
}

.wallet-balance span {
    color: #9ca3af;
}

.wallet-balance strong {
    color: white;
    font-weight: 800;
}

.wallet-link {
    color: #0066FF;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
}

.wallet-link:hover {
    color: #3395FF;
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 1024px) {
    .header-center {
        display: none;
    }
    
    .desktop-nav {
        display: none;
    }
    
    .mobile-menu-btn {
        display: flex;
    }
    
    .profile-btn {
        min-width: auto;
        padding: 6px;
    }
    
    .profile-info {
        display: none;
    }
    
    .profile-arrow {
        display: none;
    }
}

@media (max-width: 768px) {
    .header-container {
        padding: 0 16px;
    }
    
    .notifications-dropdown {
        width: 320px;
        left: -140px;
    }
    
    .profile-dropdown {
        width: 280px;
        left: -140px;
    }
}

@media (max-width: 480px) {
    .quick-actions {
        display: none;
    }
    
    .notifications-dropdown {
        width: 280px;
        left: -120px;
    }
    
    .profile-dropdown {
        width: 260px;
        left: -130px;
    }
}
