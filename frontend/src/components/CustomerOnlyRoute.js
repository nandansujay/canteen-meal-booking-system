import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerOnlyRoute({ children }) {
  const { user } = useAuth();

  if (user && user.role === 'admin') return <Navigate to="/admin" replace />;

  return children;
}
