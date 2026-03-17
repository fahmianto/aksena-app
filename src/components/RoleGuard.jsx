import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RoleGuard({ children, allowedRoles }) {
  const { userProfile, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  const role = userProfile.role || 'staff'; // default to lowest if somehow missing

  if (!allowedRoles.includes(role)) {
    // Show toast
    toast.error('Anda tidak memiliki akses ke halaman tersebut.');
    // Redirect to fallback page (e.g., harvester which is accessible by everyone)
    return <Navigate to="/harvester" replace />;
  }

  return children;
}
