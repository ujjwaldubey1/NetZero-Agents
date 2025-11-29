import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OperatorDashboard from './pages/operator/Dashboard';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorUploadPage from './pages/vendor/UploadPage';
import StaffDashboard from './pages/staff/Dashboard';
import StaffUploadPage from './pages/staff/StaffUploadPage';
import InviteVendorsPage from './pages/operator/InviteVendorsPage';
import ReportsPage from './pages/operator/ReportsPage';
import CertificatePage from './pages/operator/CertificatePage';
import ChainExplorerPage from './pages/ChainExplorerPage';
import PrivacyPage from './pages/PrivacyPage';
import StaffPage from './pages/staff/StaffPage';
import DataCentersPage from './pages/operator/DataCentersPage';
import NavBar from './components/NavBar';
import { useAuth } from './context/AuthContext';

const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

import CustomCursor from './components/CustomCursor';
import BootLoader from './components/BootLoader';

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [booted, setBooted] = useState(false);

  return (
    <Box minHeight="100vh" position="relative">
      {!booted && <BootLoader onComplete={() => setBooted(true)} />}
      <CustomCursor />
      {user && location.pathname !== '/' && <NavBar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/operator/dashboard" element={<Protected roles={['operator', 'admin']}><OperatorDashboard /></Protected>} />
          <Route path="/operator/vendors" element={<Protected roles={['operator', 'admin']}><InviteVendorsPage /></Protected>} />
          <Route path="/operator/datacenters" element={<Protected roles={['operator', 'admin']}><DataCentersPage /></Protected>} />
          <Route path="/operator/reports" element={<Protected roles={['operator', 'admin']}><ReportsPage /></Protected>} />
          <Route path="/operator/certificates" element={<Protected roles={['operator', 'admin']}><CertificatePage /></Protected>} />
          <Route path="/operator/chain" element={<Protected roles={['operator', 'admin', 'staff', 'vendor']}><ChainExplorerPage /></Protected>} />
          <Route path="/operator/privacy" element={<Protected roles={['operator', 'admin', 'staff', 'vendor']}><PrivacyPage /></Protected>} />

          <Route path="/vendor/dashboard" element={<Protected roles={['vendor']}><VendorDashboard /></Protected>} />
          <Route path="/vendor/upload" element={<Protected roles={['vendor']}><VendorUploadPage /></Protected>} />
          <Route path="/vendor/chain" element={<Protected roles={['vendor']}><ChainExplorerPage /></Protected>} />
          <Route path="/vendor/privacy" element={<Protected roles={['vendor']}><PrivacyPage /></Protected>} />

          <Route path="/staff/dashboard" element={<Protected roles={['staff']}><StaffDashboard /></Protected>} />
          <Route path="/staff/upload" element={<Protected roles={['staff']}><StaffUploadPage /></Protected>} />
          <Route path="/operator/staff" element={<Protected roles={['admin', 'operator']}><StaffPage /></Protected>} />

          {/* legacy routes */}
          <Route path="/dashboard" element={<Navigate to="/operator/dashboard" replace />} />
          <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
          <Route
            path="/upload"
            element={
              <Navigate
                to={
                  user?.role === 'vendor'
                    ? '/vendor/upload'
                    : user?.role === 'staff'
                      ? '/staff/upload'
                      : '/operator/dashboard'
                }
                replace
              />
            }
          />
          <Route path="/invite" element={<Navigate to="/operator/vendors" replace />} />
          <Route path="/reports" element={<Navigate to="/operator/reports" replace />} />
          <Route path="/certificates" element={<Navigate to="/operator/certificates" replace />} />
          <Route
            path="/staff"
            element={
              <Navigate
                to={
                  user?.role === 'staff'
                    ? '/staff/dashboard'
                    : '/operator/staff'
                }
                replace
              />
            }
          />
          <Route path="/chain" element={<Navigate to="/operator/chain" replace />} />
          <Route path="/privacy" element={<Navigate to="/operator/privacy" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </Box>
  );
};

export default App;
