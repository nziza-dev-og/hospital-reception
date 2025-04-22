import  { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main pages
import Dashboard from './pages/Dashboard';
import Patients from './pages/patients/Patients';
import PatientDetails from './pages/patients/PatientDetails';
import PatientRegistration from './pages/patients/PatientRegistration';
import Services from './pages/Services';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Support from './pages/Support';
import RegisterHospital from './pages/RegisterHospital';
import PatientDashboard from './pages/PatientDashboard';
import Appointments from './pages/appointments/Appointments';
import AppointmentDetails from './pages/appointments/AppointmentDetails';
import ScheduleAppointment from './pages/appointments/ScheduleAppointment';

// Error pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Landing page
import LandingPage from './pages/LandingPage';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRoles?: string[];
}

function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader" />
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles && userProfile && !requiredRoles.includes(userProfile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Admin and staff routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/patients" element={
          <ProtectedRoute requiredRoles={['admin', 'receptionist', 'doctor', 'nurse']}>
            <Patients />
          </ProtectedRoute>
        } />
        
        <Route path="/patients/register" element={
          <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
            <PatientRegistration />
          </ProtectedRoute>
        } />
        
        <Route path="/patients/:id" element={
          <ProtectedRoute requiredRoles={['admin', 'receptionist', 'doctor', 'nurse']}>
            <PatientDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        
        <Route path="/appointments/:id" element={
          <ProtectedRoute>
            <AppointmentDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/appointments/schedule" element={
          <ProtectedRoute requiredRoles={['admin', 'receptionist', 'patient']}>
            <ScheduleAppointment />
          </ProtectedRoute>
        } />
        
        <Route path="/services" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Services />
          </ProtectedRoute>
        } />
        
        <Route path="/staff" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Staff />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Analytics />
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/support" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />
        
        <Route path="/register-hospital" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <RegisterHospital />
          </ProtectedRoute>
        } />
        
        <Route path="/patient-dashboard" element={
          <ProtectedRoute requiredRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
 