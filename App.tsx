
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionGuard } from './components/SubscriptionGuard';

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
            <Route path="/dashboard-client" element={<ClientDashboard />} />
            <Route path="/client/post-project" element={<ClientPostProjectPage />} />
            <Route path="/client/my-projects" element={<ClientMyProjectsPage />} />
            <Route path="/client/completed-projects" element={<ClientCompletedProjectsPage />} />
            <Route path="/client/profile" element={<ClientProfilePage />} />

            {/* Editor Routes */}
            <Route path="/login-editor" element={<EditorLoginPage />} />
            <Route path="/signup-editor" element={<EditorSignupPage />} />
            
            {/* Protected Editor Routes */}
            <Route path="/editor/subscription" element={<SubscriptionGuard><EditorSubscriptionPage /></SubscriptionGuard>} />
            <Route path="/dashboard-editor" element={<SubscriptionGuard><EditorDashboard /></SubscriptionGuard>} />
            <Route path="/editor/find-projects" element={<SubscriptionGuard><EditorFindProjectsPage /></SubscriptionGuard>} />
            <Route path="/editor/my-projects" element={<SubscriptionGuard><EditorMyProjectsPage /></SubscriptionGuard>} />
            <Route path="/editor/completed-projects" element={<SubscriptionGuard><EditorCompletedProjectsPage /></SubscriptionGuard>} />
            <Route path="/editor/profile" element={<SubscriptionGuard><EditorProfilePage /></SubscriptionGuard>} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminPanelPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
