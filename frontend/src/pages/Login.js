import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 px-6">
      <div className="flex flex-col items-center mb-6">
        <span className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3">
          <UtensilsCrossed size={24} />
        </span>
        <h1 className="text-xl font-bold text-zinc-100">Welcome back</h1>
        <p className="text-sm text-zinc-500 mt-1">Login to book your meals</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" disabled={loading} className="btn-primary py-2.5 mt-1">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <p className="text-sm text-zinc-500 mt-5 text-center">
        No account?{' '}
        <Link to="/register" className="text-brand-400 font-medium">
          Register
        </Link>
      </p>
    </div>
  );
}
