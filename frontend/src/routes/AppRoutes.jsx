import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../components/common/ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOTP from '../pages/auth/VerifyOTP';

const AuthenticatedLanding = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="rounded-xl bg-white p-8 text-center shadow">
      <h1 className="text-2xl font-bold text-slate-900">Authenticated</h1>
      <p className="mt-2 text-slate-600">Your authentication foundation is active.</p>
    </div>
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOTP />} />
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<AuthenticatedLanding />} />
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
