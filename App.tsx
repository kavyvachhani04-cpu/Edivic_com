
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionGuard } from './components/SubscriptionGuard';
import { RoleGuard } from './components/RoleGuard';

// Client Pages
import ClientSignupPage from './pages/ClientSignupPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientDashboard from './pages/ClientDashboard';
import ClientPostProjectPage from './pages/ClientPostProjectPage'; 
import ClientMyProjectsPage from './pages/ClientMyProjectsPage'; 
import ClientCompletedProjectsPage from './pages/ClientCompletedProjectsPage'; 
import ClientProfilePage from './pages/ClientProfilePage'; 

// Editor Pages
import EditorSignupPage from './pages/EditorSignupPage';
import EditorLoginPage from './pages/EditorLoginPage';
import EditorDashboard from './pages/EditorDashboard';
import EditorFindProjectsPage from './pages/EditorFindProjectsPage'; 
import EditorMyProjectsPage from './pages/EditorMyProjectsPage'; 
import EditorCompletedProjectsPage from './pages/EditorCompletedProjectsPage'; 
import EditorProfilePage from './pages/EditorProfilePage'; 
import EditorSubscriptionPage from './pages/EditorSubscriptionPage';

// Content Pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';

const URLParamHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchParams.get('admin') === 'true') {
            navigate('/admin/login');
        }
    }, [searchParams, navigate]);

    return null;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <URLParamHandler />
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Client Routes */}
            <Route path="/login-client" element={<ClientLoginPage />} />
            <Route path="/signup-client" element={<ClientSignupPage />} />
            <Route path="/dashboard-client" element={<RoleGuard allowedRoles={['client']}><ClientDashboard /></RoleGuard>} />
            <Route path="/client/post-project" element={<RoleGuard allowedRoles={['client']}><ClientPostProjectPage /></RoleGuard>} />
            <Route path="/client/my-projects" element={<RoleGuard allowedRoles={['client']}><ClientMyProjectsPage /></RoleGuard>} />
            <Route path="/client/completed-projects" element={<RoleGuard allowedRoles={['client']}><ClientCompletedProjectsPage /></RoleGuard>} />
            <Route path="/client/profile" element={<RoleGuard allowedRoles={['client']}><ClientProfilePage /></RoleGuard>} />

            {/* Editor Routes */}
            <Route path="/login-editor" element={<EditorLoginPage />} />
            <Route path="/signup-editor" element={<EditorSignupPage />} />
            
            {/* Protected Editor Routes */}
            <Route path="/editor/subscription" element={<EditorSubscriptionPage />} />
            <Route path="/dashboard-editor" element={<RoleGuard allowedRoles={['editor']}><SubscriptionGuard><EditorDashboard /></SubscriptionGuard></RoleGuard>} />
            <Route path="/editor/find-projects" element={<RoleGuard allowedRoles={['editor']}><SubscriptionGuard><EditorFindProjectsPage /></SubscriptionGuard></RoleGuard>} />
            <Route path="/editor/my-projects" element={<RoleGuard allowedRoles={['editor']}><SubscriptionGuard><EditorMyProjectsPage /></SubscriptionGuard></RoleGuard>} />
            <Route path="/editor/completed-projects" element={<RoleGuard allowedRoles={['editor']}><SubscriptionGuard><EditorCompletedProjectsPage /></SubscriptionGuard></RoleGuard>} />
            <Route path="/editor/profile" element={<RoleGuard allowedRoles={['editor']}><SubscriptionGuard><EditorProfilePage /></SubscriptionGuard></RoleGuard>} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<RoleGuard allowedRoles={['admin']}><AdminPanelPage /></RoleGuard>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
