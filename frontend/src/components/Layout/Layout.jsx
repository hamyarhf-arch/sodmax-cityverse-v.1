/* frontend/src/components/Layout/Layout.css */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f6f7f9 0%, #eef1f5 100%);
}

.layout-content {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 70px);
}

/* Sidebar Styles */
.sidebar-container {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease;
  overflow-y: auto;
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  z-index: 40;
}

.sidebar-container.closed {
  width: 80px;
}

.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-sidebar-overlay.open {
  opacity: 1;
  visibility: visible;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
}

.mobile-sidebar-overlay.open .mobile-sidebar {
  transform: translateX(0);
}

/* Main Content */
.main-content {
  flex: 1;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
}

.main-content.full-width {
  margin-left: 0;
}

.content-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100%;
}

@media (max-width: 768px) {
  .content-container {
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .content-container {
    padding: 1rem;
  }
}

/* Footer */
.footer {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
  padding: 4rem 0 2rem;
  margin-top: auto;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 3rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .footer-content {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-section:first-child {
  grid-column: 1 / -1;
}

@media (min-width: 768px) {
  .footer-section:first-child {
    grid-column: span 2;
  }
}

@media (min-width: 1024px) {
  .footer-section:first-child {
    grid-column: span 1;
  }
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.footer-logo-icon {
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.footer-logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: #d1d5db;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  transition: all 0.3s;
}

.social-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateY(-3px);
}

.footer-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.2s;
  display: inline-block;
  padding: 0.25rem 0;
}

.footer-links a:hover {
  color: #667eea;
  transform: translateX(5px);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
  }
}

.footer-copyright {
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
}

.footer-technologies {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tech-tag {
  padding: 0.375rem 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* Smooth transitions for page changes */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}

.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 300ms, transform 300ms;
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(102, 126, 234, 0.1);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
}

/* Error States */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
  color: #ef4444;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.error-message {
  color: #6b7280;
  max-width: 400px;
  line-height: 1.6;
}

.error-action {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.error-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Empty States */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1.5rem;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #9ca3af;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4b5563;
}

.empty-message {
  color: #6b7280;
  max-width: 400px;
  line-height: 1.6;
}

.empty-action {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
}

.empty-action:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}
