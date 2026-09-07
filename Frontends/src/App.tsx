import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { ChatWidget } from './components/common/ChatWidget';

// Public views
import { HomeView } from './views/public/HomeView';
import { CatalogueView } from './views/public/CatalogueView';
import { ProductDetailView } from './views/public/ProductDetailView';
import { SimulatorView } from './views/public/SimulatorView';
import { ApplyView } from './views/public/ApplyView';
import { SuccessView } from './views/public/SuccessView';

// Admin views
import { AdminLoginView } from './views/admin/AdminLoginView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { ApplicationsInboxView } from './views/admin/ApplicationsInboxView';
import { ApplicationDetailView } from './views/admin/ApplicationDetailView';
import { ProductCmsView } from './views/admin/ProductCmsView';
import { SimulationRulesView } from './views/admin/SimulationRulesView';
import { OrganizationView } from './views/admin/OrganizationView';
import { AuditLogView } from './views/admin/AuditLogView';

const RouterView: React.FC = () => {
  const { currentPath, authLoading, isAdminLoggedIn } = useApp();

  // Route matching only ever cares about the path itself - strip any query
  // string (e.g. "/admin/applications?status=Submitted", used by the
  // dashboard's summary cards to deep-link into a pre-filtered inbox) before
  // every comparison below. The views that care about query params (e.g.
  // ApplicationsInboxView) read window.location.search themselves.
  const pathname = currentPath.split('?')[0];

  // Route matching helpers
  if (pathname === '/admin/login' || pathname === '/login') {
    return <AdminLoginView />;
  }

  // Auth guard: any other /admin/* route requires a real, verified session
  // (GET /me on load). While that check is in flight, render nothing rather
  // than flashing the login screen for an already-authenticated user.
  if (pathname.startsWith('/admin')) {
    if (authLoading) {
      return null;
    }
    if (!isAdminLoggedIn) {
      return <AdminLoginView />;
    }
  }

  if (pathname === '/admin/dashboard') {
    return <AdminDashboardView />;
  }

  if (pathname === '/admin/applications') {
    return <ApplicationsInboxView />;
  }

  if (pathname.startsWith('/admin/applications/')) {
    const id = pathname.replace('/admin/applications/', '');
    return <ApplicationDetailView id={id} />;
  }

  if (pathname === '/admin/products') {
    return <ProductCmsView />;
  }

  if (pathname.includes('/simulation-rules')) {
    const parts = pathname.split('/');
    const slugIndex = parts.indexOf('products') + 1;
    const slug = parts[slugIndex] || 'praxis-jiwa-utama';
    return <SimulationRulesView slug={slug} />;
  }

  if (pathname === '/admin/organization' || pathname === '/admin/users' || pathname === '/admin/roles') {
    return <OrganizationView />;
  }

  if (pathname === '/admin/audit') {
    return <AuditLogView />;
  }

  // Public surface routes (Rendered with Public Navbar & Footer)
  let publicContent: React.ReactNode;

  if (pathname === '/' || pathname === '') {
    publicContent = <HomeView />;
  } else if (pathname === '/products') {
    publicContent = <CatalogueView />;
  } else if (pathname.startsWith('/products/') && pathname.endsWith('/simulate')) {
    const slug = pathname.replace('/products/', '').replace('/simulate', '');
    publicContent = <SimulatorView slug={slug} />;
  } else if (pathname.startsWith('/products/')) {
    const slug = pathname.replace('/products/', '');
    publicContent = <ProductDetailView slug={slug} />;
  } else if (pathname === '/apply') {
    publicContent = <ApplyView />;
  } else if (pathname.startsWith('/application/success')) {
    const ref = pathname.replace('/application/success/', '');
    publicContent = <SuccessView reference={ref} />;
  } else {
    // Fallback to HomeView
    publicContent = <HomeView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1">
        {publicContent}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RouterView />
      <ToastContainer />
    </AppProvider>
  );
}
