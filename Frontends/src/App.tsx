import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';

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

  // Route matching helpers
  if (currentPath === '/admin/login' || currentPath === '/login') {
    return <AdminLoginView />;
  }

  // Auth guard: any other /admin/* route requires a real, verified session
  // (GET /me on load). While that check is in flight, render nothing rather
  // than flashing the login screen for an already-authenticated user.
  if (currentPath.startsWith('/admin')) {
    if (authLoading) {
      return null;
    }
    if (!isAdminLoggedIn) {
      return <AdminLoginView />;
    }
  }

  if (currentPath === '/admin/dashboard') {
    return <AdminDashboardView />;
  }

  if (currentPath === '/admin/applications') {
    return <ApplicationsInboxView />;
  }

  if (currentPath.startsWith('/admin/applications/')) {
    const id = currentPath.replace('/admin/applications/', '');
    return <ApplicationDetailView id={id} />;
  }

  if (currentPath === '/admin/products') {
    return <ProductCmsView />;
  }

  if (currentPath.includes('/simulation-rules')) {
    const parts = currentPath.split('/');
    const slugIndex = parts.indexOf('products') + 1;
    const slug = parts[slugIndex] || 'praxis-jiwa-utama';
    return <SimulationRulesView slug={slug} />;
  }

  if (currentPath === '/admin/organization' || currentPath === '/admin/users' || currentPath === '/admin/roles') {
    return <OrganizationView />;
  }

  if (currentPath === '/admin/audit') {
    return <AuditLogView />;
  }

  // Public surface routes (Rendered with Public Navbar & Footer)
  let publicContent: React.ReactNode;

  if (currentPath === '/' || currentPath === '') {
    publicContent = <HomeView />;
  } else if (currentPath === '/products') {
    publicContent = <CatalogueView />;
  } else if (currentPath.startsWith('/products/') && currentPath.endsWith('/simulate')) {
    const slug = currentPath.replace('/products/', '').replace('/simulate', '');
    publicContent = <SimulatorView slug={slug} />;
  } else if (currentPath.startsWith('/products/')) {
    const slug = currentPath.replace('/products/', '');
    publicContent = <ProductDetailView slug={slug} />;
  } else if (currentPath === '/apply') {
    publicContent = <ApplyView />;
  } else if (currentPath.startsWith('/application/success')) {
    const ref = currentPath.replace('/application/success/', '');
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
