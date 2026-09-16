import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!GMAIL_REGEX.test(form.email)) {
      next.email = 'Email must be a valid @gmail.com address';
    }
    if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register(form);
      toast.success(
        user.role === 'admin' ? 'Admin account created!' : 'Account created! You start with ₹1000 wallet credit.'
      );
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-6">
      <div className="flex flex-col items-center mb-6">
        <span className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3">
          <UtensilsCrossed size={24} />
        </span>
        <h1 className="text-xl font-bold text-zinc-100">Create an account</h1>
        <p className="text-sm text-zinc-500 mt-1">Start booking meals in seconds</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            className="input-field"
          />
          <div>
            <input
              type="email"
              placeholder="Email (must be @gmail.com)"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              className={`input-field w-full ${errors.email ? 'ring-2 ring-red-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              className={`input-field w-full ${errors.password ? 'ring-2 ring-red-500' : ''}`}
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>
          <input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="input-field"
          />
          <select
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            className="input-field"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={loading} className="btn-primary py-2.5 mt-1">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>

      <p className="text-sm text-zinc-500 mt-5 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
